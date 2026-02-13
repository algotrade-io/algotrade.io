/**
 * DisclaimerModal Component
 * Modal for displaying Terms of Service and Financial Disclaimer acknowledgment.
 */

import { useState } from 'react';
import { Modal, Checkbox, Button } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import TOS, { TOSTitleText } from '@/pages/tos';
import { getApiUrl } from '@/utils';
import overrides from './index.module.less';
import type { Account, AuthUser, SetState } from '@/types';

interface DisclaimerModalProps {
  account: Account | undefined;
  loggedIn: AuthUser | null;
  setAccount: SetState<Account | undefined>;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  account,
  loggedIn,
  setAccount,
}) => {
  const [checked, setChecked] = useState(false);
  const [acknowledgeLoading, setAcknowledgeLoading] = useState(false);

  const onCheck = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked);
  };

  const onAcknowledge = () => {
    setAcknowledgeLoading(true);
    const jwtToken = (loggedIn as any)?.signInUserSession?.idToken?.jwtToken;
    const url = `${getApiUrl()}/account`;
    fetch(url, {
      method: 'POST',
      headers: { Authorization: jwtToken },
      body: JSON.stringify({ permissions: { read_disclaimer: true } }),
    })
      .then((response) => response.json())
      .then((data) => setAccount(data))
      .catch((err) => console.error(err))
      .finally(() => setAcknowledgeLoading(false));
  };

  const showModal = account && !account?.permissions?.read_disclaimer;

  return (
    <Modal
      width={600}
      title={TOSTitleText(true)}
      bodyStyle={{
        height: '200px',
        padding: '24px',
        overflowY: 'scroll',
        color: 'rgba(255, 255, 255, 0.45)',
      }}
      open={showModal}
      closable={false}
      centered
      zIndex={2000}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: '8px',
          }}
        >
          <Checkbox
            className={overrides.checkbox}
            checked={checked}
            onChange={onCheck}
            style={{ textAlign: 'left', width: '100%' }}
          >
            <>
              <span>{'I agree to the Terms of Service '}</span>
              <br className={overrides.mobileBreak} />
              <span>{'& Financial Disclaimer.'}</span>
            </>
          </Checkbox>
          <Button
            className={overrides.start}
            loading={acknowledgeLoading}
            disabled={!checked}
            onClick={onAcknowledge}
          >
            OK
          </Button>
        </div>
      }
    >
      <TOS modal />
    </Modal>
  );
};

export default DisclaimerModal;
