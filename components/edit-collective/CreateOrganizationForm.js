import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';

import { Box, Flex } from '../Grid';
import InputField from '../InputField';

class CreateOrganizationForm extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = { form: {} };

    this.messages = defineMessages({
      'order.organization.name': {
        id: 'Fields.name',
        defaultMessage: 'Name',
      },
      'order.organization.website': {
        id: 'Fields.website',
        defaultMessage: 'Website',
      },
      'FormField.optional': {
        id: 'FormField.optional',
        defaultMessage: 'optional',
      },
    });
  }

  handleChange(attr, value) {
    const { form } = this.state;
    form[attr] = value;
    this.setState({ form });
    this.props.onChange(form);
  }

  render() {
    const { intl } = this.props;

    return (
      <section className="organizationDetailsForm">
        <Flex flexWrap="wrap" key="organization.name.input">
          <Box width={1}>
            <InputField
              className="horizontal"
              type="text"
              name="organization_name"
              label={intl.formatMessage(this.messages['order.organization.name'])}
              onChange={value => this.handleChange('name', value)}
            />
          </Box>
        </Flex>
        <Flex flexWrap="wrap" key="organization.website.input">
          <Box width={1}>
            <InputField
              className="horizontal"
              type="text"
              name="organization_website"
              label={intl.formatMessage(this.messages['order.organization.website'])}
              onChange={value => this.handleChange('website', value)}
            />
          </Box>
        </Flex>
        <Flex flexWrap="wrap" key="organization.twitterHandle.input">
          <Box width={1}>
            <InputField
              className="horizontal"
              type="text"
              name="organization_twitterHandle"
              pre="@"
              label="Twitter"
              help={intl.formatMessage(this.messages['FormField.optional'])}
              onChange={value => this.handleChange('twitterHandle', value)}
            />
          </Box>
        </Flex>
      </section>
    );
  }
}

export default injectIntl(CreateOrganizationForm);
