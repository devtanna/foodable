import React, { useState } from 'react';
import {
  Button,
  Modal,
  Input,
  Form,
  Icon,
  Message,
  TextArea,
} from 'semantic-ui-react';
import { contactUs } from '../helpers/api';

const ContactUsModal = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!email || !message) {
      setError('Please fill in all the fields');
      return;
    }

    try {
      setLoading(true);
      let contacted = await contactUs(email, message);
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="tiny" closeIcon trigger={<span>Give us Feedback</span>}>
      <Modal.Header>We would love to hear your feedback!</Modal.Header>
      {success ? (
        <Modal.Content>
          <Modal.Description>
            <Message
              positive
              size="small"
              icon="check"
              header="Thanks for getting in touch!"
              content="We have successfully received your message."
            />
          </Modal.Description>
        </Modal.Content>
      ) : (
        <React.Fragment>
          <Modal.Content>
            <Modal.Description>
              {error && (
                <Message error size="tiny" icon="exclamation" header={error} />
              )}
              <Form>
                <Form.Field>
                  <Input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    fluid
                    placeholder="Email address*"
                  />
                </Form.Field>
                <Form.Field>
                  <TextArea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Your message...be nice?*"
                  />
                </Form.Field>
              </Form>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button loading={loading} color="blue" onClick={handleSubmit}>
              <Icon name="send" /> Submit
            </Button>
          </Modal.Actions>
        </React.Fragment>
      )}
    </Modal>
  );
};

export default ContactUsModal;
