import { get, uniqBy } from 'lodash';

import { CollectiveType } from './constants/collectives';
import type { ReverseCompatibleMemberRole } from './constants/roles';
import type { GraphQLV1Collective } from './custom_typings/GraphQLV1';
import { type CommentFieldsFragment } from './graphql/types/v2/graphql';
import { type Account, type AccountWithParent, MemberRole, type Update } from './graphql/types/v2/schema';
import type { PREVIEW_FEATURE_KEYS, PreviewFeature } from './preview-features';
import { previewFeatures } from './preview-features';

/**
 * Represent the current logged in user. Includes methods to check permissions.
 */
class LoggedInUser {
  private roles: Record<number, ReverseCompatibleMemberRole[]>;
  public CollectiveId: number;
  public collective: GraphQLV1Collective;
  public isRoot: boolean;
  public hasTwoFactorAuth: boolean;
  public email: string;
  public memberOf: Array<{ id: number; role: ReverseCompatibleMemberRole; collective: GraphQLV1Collective }>;

  constructor(data) {
    Object.assign(this, data);
    if (this.memberOf) {
      // Build a map of roles like { [collectiveSlug]: [ADMIN, BACKER...] }
      this.roles = this.memberOf.reduce((roles, member) => {
        if (member.collective) {
          roles[member.collective.slug] = roles[member.collective.slug] || [];
          roles[member.collective.slug].push(member.role);
        }

        return roles;
      }, {});
    }
  }

  /**
   * hasRole if LoggedInUser has one of the roles for the given collective
   */
  hasRole(roles: ReverseCompatibleMemberRole | ReverseCompatibleMemberRole[], collective: { slug: string }) {
    if (!collective || !this.roles[collective.slug]) {
      return false;
    } else if (typeof roles === 'string') {
      return this.roles[collective.slug].includes(roles);
    } else if (Array.isArray(roles)) {
      return this.roles[collective.slug].some(role => roles.includes(role));
    }
  }

  /**
   * isAdminOfCollective if LoggedInUser is
   * - its own USER collective
   * - is admin of the collective
   * - is host of the collective
   */
  isAdminOfCollective(
    collective:
      | Pick<GraphQLV1Collective, 'id' | 'slug' | 'type' | 'parentCollective'>
      | (Pick<Account, 'slug' | 'type'> & { id?: Account['id']; parent?: Pick<AccountWithParent['parent'], 'slug'> }),
  ) {
    if (!collective) {
      return false;
    } else if (collective.type === CollectiveType.EVENT) {
      return this.canEditEvent(collective);
    } else if (collective.type === CollectiveType.PROJECT) {
      return this.canEditProject(collective);
    } else {
      return (
        (collective['id'] && collective['id'] === this.CollectiveId) ||
        collective.slug === get(this, 'collective.slug') ||
        this.hasRole(MemberRole.ADMIN, collective)
      );
    }
  }

  /**
   * isAdminOfCollectiveOrHost if LoggedInUser is
   * - its own USER collective
   * - is admin of the collective
   * - is host of the collective
   */
  isAdminOfCollectiveOrHost(
    collective: Parameters<typeof LoggedInUser.prototype.isAdminOfCollective>[0] &
      Parameters<typeof LoggedInUser.prototype.hasRole>[1] &
      Parameters<typeof LoggedInUser.prototype.isHostAdmin>[0],
  ) {
    if (!collective) {
      return false;
    } else if (this.isAdminOfCollective(collective)) {
      return true;
    } else {
      return this.hasRole([MemberRole.HOST, MemberRole.ADMIN], collective) || this.isHostAdmin(collective);
    }
  }

  /**
   * Has access to admin panel if admin or accountant
   */
  canSeeAdminPanel(collective: Parameters<typeof LoggedInUser.prototype.hasRole>[1]) {
    return this.hasRole([MemberRole.ADMIN, MemberRole.ACCOUNTANT], collective);
  }

  /**
   * CanEditComment if LoggedInUser is
   * - creator of the comment
   * - is admin or host of the collective
   */
  canEditComment(comment: CommentFieldsFragment) {
    if (!comment) {
      return false;
    }

    return (
      this.hasRole([MemberRole.HOST, MemberRole.ADMIN], comment.account) ||
      this.isHostAdmin(comment.account) ||
      this.isSelf(comment.fromAccount) ||
      this.canEditEvent(comment.account)
    );
  }

  /**
   * Returns true if passed collective is the user collective
   */
  isSelf(collective: Pick<GraphQLV1Collective, 'id' | 'slug'> | Pick<Account, 'slug'>) {
    if (!collective) {
      return false;
    } else if (typeof collective['id'] === 'number') {
      return collective['id'] === this.CollectiveId;
    } else {
      return collective.slug === this.collective.slug;
    }
  }

  /**
   * CanEditEvent if LoggedInUser is
   * - admin of the event
   * - admin of the parent collective
   */
  canEditEvent(
    event:
      | Pick<GraphQLV1Collective, 'slug' | 'type' | 'parentCollective'>
      | (Pick<Account & AccountWithParent, 'slug' | 'type'> & { parent?: Pick<AccountWithParent['parent'], 'slug'> }),
  ) {
    if (!event) {
      return false;
    } else if (event.type !== CollectiveType.EVENT) {
      return false;
    }

    const parent = event['parentCollective'] || event['parent'];
    return this.hasRole(MemberRole.ADMIN, parent) || this.hasRole(MemberRole.ADMIN, event);
  }

  /**
   * CanEditProject if LoggedInUser is
   * - admin of the project
   * - admin of the parent collective
   */
  canEditProject(
    project:
      | Pick<GraphQLV1Collective, 'slug' | 'type' | 'parentCollective'>
      | (Pick<Account & AccountWithParent, 'slug' | 'type'> & { parent?: Pick<AccountWithParent['parent'], 'slug'> }),
  ) {
    if (!project) {
      return false;
    } else if (project.type !== CollectiveType.PROJECT) {
      return false;
    }

    const parent = project['parentCollective'] || project['parent'];
    return this.hasRole(MemberRole.ADMIN, parent) || this.hasRole(MemberRole.ADMIN, project);
  }

  /**
   * Returns true if user can edit this update
   */
  canEditUpdate(update: Update) {
    if (!update) {
      return false;
    } else if (this.isAdminOfCollectiveOrHost(update.fromAccount)) {
      return true; // if admin of collective author
    } else if (this.isAdminOfCollectiveOrHost(update.account)) {
      return true;
    }
  }

  /**
   * List all the hosts this user belongs to and is admin of
   */
  hostsUserIsAdminOf(): GraphQLV1Collective[] {
    const collectives = this.memberOf
      .filter(m => m.collective.isHost)
      .filter(m => this.hasRole(MemberRole.ADMIN, m.collective))
      .map(m => m.collective);

    return uniqBy(collectives, 'id');
  }

  isHostAdmin(
    collective: Parameters<typeof LoggedInUser.prototype.hasRole>[1] & {
      host?: Parameters<typeof LoggedInUser.prototype.hasRole>[1];
    },
  ) {
    if (!collective || !collective.host) {
      return false;
    } else {
      return this.hasRole(MemberRole.ADMIN, collective.host) || this.hasRole(MemberRole.HOST, collective);
    }
  }

  /**
   * Returns true if the logged in user is an accountant of the collective, and nothing else
   */
  isAccountantOnly(collective) {
    return !this.isAdminOfCollective(collective) && this.hasRole(MemberRole.ACCOUNTANT, collective);
  }

  hasPreviewFeatureEnabled(featureKey: PREVIEW_FEATURE_KEYS | `${PREVIEW_FEATURE_KEYS}`) {
    const { earlyAccess = {} } = this.collective.settings;
    const feature = previewFeatures.find(f => f.key === featureKey);
    if (!feature) {
      // eslint-disable-next-line no-console
      console.warn(`Preview feature ${featureKey} not found`);
      return false;
    }

    if ('isEnabled' in feature && typeof feature.isEnabled === 'function') {
      return feature.isEnabled();
    }

    const enabledByDefault = feature.enabledByDefaultFor?.some(
      slug => slug === '*' || this.hasRole([MemberRole.ADMIN, MemberRole.MEMBER], { slug }),
    );
    const isTurnedOn = earlyAccess[featureKey] === true;
    const isTurnedOff = earlyAccess[featureKey] === false;
    const isEnabledInEnv = !feature.env || (feature.env as string[]).includes(process.env.OC_ENV);
    const isEnabledByDevEnv =
      feature.alwaysEnableInDev &&
      (['development', 'staging'].includes(process.env.NODE_ENV) || ['e2e'].includes(process.env.OC_ENV));

    return (
      (isEnabledByDevEnv && !isTurnedOff) ||
      Boolean(isEnabledInEnv && (isTurnedOn || (enabledByDefault && !isTurnedOff)))
    );
  }

  getAvailablePreviewFeatures(): PreviewFeature[] {
    const { earlyAccess = {} } = this.collective.settings;

    /**
     * Include preview features when
     * - they are in public beta
     * - the user have a saved setting for it
     * - the user is admin/member of an account that have closed beta access or feature enabled by default
     */
    const availablePreviewFeatures = previewFeatures.filter(feature => {
      const userHaveSetting = typeof earlyAccess[feature.key] !== 'undefined';
      const hasClosedBetaAccess = feature.closedBetaAccessFor?.some(slug =>
        this.hasRole([MemberRole.ADMIN, MemberRole.MEMBER], { slug }),
      );
      const enabledByDefault = feature.enabledByDefaultFor?.some(
        slug => slug === '*' || this.hasRole([MemberRole.ADMIN, MemberRole.MEMBER], { slug }),
      );
      const isEnabledInEnv = !feature.env || (feature.env as string[]).includes(process.env.OC_ENV);
      const isEnabledByDevEnv =
        feature.alwaysEnableInDev &&
        (['development', 'staging'].includes(process.env.NODE_ENV) || ['e2e'].includes(process.env.OC_ENV));
      const hasAccess = feature.hasAccess?.(this);
      return (
        isEnabledInEnv &&
        (isEnabledByDevEnv ||
          feature.publicBeta ||
          userHaveSetting ||
          hasClosedBetaAccess ||
          enabledByDefault ||
          hasAccess)
      );
    });

    return availablePreviewFeatures;
  }
}

export default LoggedInUser;
