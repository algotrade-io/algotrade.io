/**
 * Footer Component
 * Site footer with links to terms of service and privacy policy.
 */

import { Layout as AntLayout } from 'antd';
import { NavLink } from 'react-router-dom';
import overrides from './index.module.less';
import { footerHeight } from './config';

interface FooterProps {
  setSelectedMenuIdx: (idx: number) => void;
}

const Footer: React.FC<FooterProps> = ({ setSelectedMenuIdx }) => {
  return (
    <AntLayout.Footer
      style={{
        maxHeight: footerHeight,
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span className={overrides.footerLink}>_move fast; break everything</span>
      <NavLink
        onClick={() => setSelectedMenuIdx(0)}
        className={overrides.footerLink}
        to="/tos"
      >
        Terms of Service & Financial Disclaimer
      </NavLink>
      <NavLink
        onClick={() => setSelectedMenuIdx(0)}
        className={overrides.footerLink}
        to="/privacy"
      >
        Privacy
      </NavLink>
    </AntLayout.Footer>
  );
};

export default Footer;
