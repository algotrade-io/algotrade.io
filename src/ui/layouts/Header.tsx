/**
 * Header Component
 * Main navigation header with logo, menu, and authentication controls.
 */

import { Layout as AntLayout, Menu, Button, Modal } from 'antd';
import { NavLink } from 'react-router-dom';
import { Authenticator, AmplifyProvider } from '@aws-amplify/ui-react';
import BTC_ICE from '@/assets/logo.png';
import styles from './index.module.less';
import { HeaderHeight } from './Header.styles';
import { authTheme, routes, headerHeight } from './config';
import type { AuthUser } from '@/types';

interface HeaderProps {
    loggedIn: AuthUser | null;
    loginLoading: boolean;
    showModal: boolean;
    selectedMenuIdx: number;
    setSelectedMenuIdx: (idx: number) => void;
    setShowLogin: (show: boolean) => void;
    signOut: () => void;
}

const Header: React.FC<HeaderProps> = ({
    loggedIn,
    loginLoading,
    showModal,
    selectedMenuIdx,
    setSelectedMenuIdx,
    setShowLogin,
    signOut,
}) => {
    const getAccountText = (user: string | undefined) => `signed in as ${user}`;
    const accountText = getAccountText(
        loggedIn?.attributes?.name || loggedIn?.attributes?.email
    );
    // Filter out home link from antd's menu "selected" css stylings
    const selectedMenuItems = selectedMenuIdx ? [selectedMenuIdx.toString()] : [];
    // Invisible authenticator needed for auth state
    const dummy = <Authenticator className={styles.invisible} />;

    return (
        <AntLayout.Header
            style={{
                zIndex: 1000,
                width: '100%',
                position: 'fixed',
                height: headerHeight,
            }}
        >
            <span className={styles.headerWrapper}>
                <img className="logo" src={BTC_ICE} width={24} height={24} alt="logo" />
                <Menu
                    onClick={(item) => setSelectedMenuIdx(parseInt(item.key))}
                    style={{ height: headerHeight, width: '100%' }}
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={selectedMenuItems}
                    selectedKeys={selectedMenuItems}
                    items={routes.map((route: { text: React.ReactNode; to: string }, idx: number) => ({
                        className: [styles.white, styles.ice].join(' '),
                        key: idx.toString(),
                        style:
                            idx === 0
                                ? { backgroundColor: 'transparent' }
                                : { display: 'flex', alignItems: 'center' },
                        label: <NavLink to={route.to}>{route.text}</NavLink>,
                    }))}
                />
                {dummy}
                {!loginLoading && (
                    <span className={styles.authActions}>
                        {loggedIn && <span className={styles.account}>{accountText}</span>}
                        {loggedIn ? (
                            <Button
                                className={styles.signOut}
                                onClick={() => {
                                    setShowLogin(false);
                                    signOut();
                                }}
                            >
                                Sign out
                            </Button>
                        ) : (
                            <Button className={styles.start} onClick={() => setShowLogin(true)}>
                                Get started
                            </Button>
                        )}
                        <Modal
                            style={{ height: '462px' }}
                            open={showModal}
                            closable={false}
                            centered
                            onCancel={() => setShowLogin(false)}
                            footer={null}
                            zIndex={2000}
                        >
                            <AmplifyProvider theme={authTheme} colorMode="dark">
                                <Authenticator />
                            </AmplifyProvider>
                        </Modal>
                    </span>
                )}
            </span>
        </AntLayout.Header>
    );
};

export default Header;
export { HeaderHeight };
