/**
 * DisclaimerModal Component
 * Modal for displaying Terms of Service and Financial Disclaimer acknowledgment.
 */

import { useState } from 'react';
import { Modal, Checkbox, Button } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import TOS, { TOSTitleText } from '@/pages/tos';
import { useAccountPost } from '@/hooks';
import overrides from './index.module.less';
import type { Account, AuthUser, SetState } from '@/types';

interface DisclaimerModalProps {
    account: Account | null;
    loggedIn: AuthUser | null;
    setAccount: SetState<Account | null>;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
    account,
    loggedIn,
    setAccount,
}) => {
    const [checked, setChecked] = useState(false);
    const { postAccount, loading: acknowledgeLoading } = useAccountPost(
        loggedIn?.signInUserSession?.idToken?.jwtToken
    );

    const onCheck = (e: CheckboxChangeEvent) => {
        setChecked(e.target.checked);
    };

    const onAcknowledge = async () => {
        const data = await postAccount<Account>({ permissions: { read_disclaimer: true } });
        if (data) {
            setAccount(data);
        }
    };

    const showModal = Boolean(account && !account?.permissions?.read_disclaimer);

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
