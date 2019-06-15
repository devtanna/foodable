import React, { useState } from 'react';
import { Input, Form, Label, Icon, Message } from 'semantic-ui-react';
import { subscribe } from '../helpers/api';

const SubscribeField = () => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async email => {
    try {
      setError(null);
      setLoading(true);
      let subscribed = await subscribe(email);
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form>
      <Form.Field>
        <p>
          Get everyday&#39;s top food promotions in your inbox, subscribe to our
          newsletter!
        </p>
        {success ? (
          <Message
            positive
            size="tiny"
            icon="check"
            header="Thanks!"
            content="You have been successfully subscribed to our newsletter"
          />
        ) : (
          <Input
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSubmit(value)}
            fluid
            loading={loading}
            action={{
              color: 'orange',
              content: 'Subscribe',
              onClick: e => handleSubmit(value),
            }}
            placeholder="Email address"
          />
        )}
        {error && (
          <Label basic color="red" pointing>
            {error}
          </Label>
        )}
      </Form.Field>
    </Form>
  );
};

export default SubscribeField;
