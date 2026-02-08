import { Typography } from "antd";
import { NavLink } from "react-router-dom";
const { Title } = Typography;

export const TOSTitleText = (modal = false) => (
  <Title level={modal ? 4 : 1}>
    {"Terms of Service & Financial Disclaimer"}
  </Title>
);

const TOSPage = ({ modal } = { modal: false }) => {
  const sublevel = modal ? 5 : 2;
  return (
    <div style={{ wordWrap: "break-word" }}>
      {!modal && TOSTitleText()}
      {modal && <Title level={sublevel}>Meta</Title>}
      <p className="small">Effective 4 July 2022</p>
      <p>From time to time FORCEPU.SH may review and update this Policy.</p>
      <p>
        The trading signals and charts (”Information”) from FORCEPU.SH are
        provided by FORCEPU.SH (” FORCEPU.SH”). Your use of FORCEPU.SH
        constitutes your acceptance of this Policy.
      </p>
      <p>
        The information contained in our services and sites are compiled for the
        convenience of the visitors, members, and subscribers and is furnished
        without responsibility for its accuracy. The sites and services visitors
        and subscribers access to information contained within those services
        and sites is on the condition that errors or omissions shall not be made
        the basis of any claim, demand, or cause of action against FORCEPU.SH or
        anyone affiliated therewith.
      </p>

      <section id="terms-and-conditions">
        <Title level={sublevel}>Terms and Conditions</Title>
        <p>
          The information provided by FORCEPU.SH on the FORCEPU.SH web site is
          owned by or licensed to FORCEPU.SH and any user is permitted to store,
          manipulate, analyze, reformat, print and display information from
          FORCEPU.SH only for such user’s personal use. In no event shall any
          user publish, retransmit, redistribute or otherwise reproduce any
          information from FORCEPU.SH in any format to anyone. Prior to the
          execution of a security trade based upon information from FORCEPU.SH,
          you are advised to consult with your broker or other financial
          representative.
        </p>
        <p>
          FORCEPU.SH does not make any express or implied warranties (including,
          without limitation, any warranty of merchantability or fitness for a
          particular purpose or use) regarding information from FORCEPU.SH.
          Information from FORCEPU.SH is provided to the users “as is.”
          FORCEPU.SH will not be liable to any user or anyone else for any
          interruption, inaccuracy, error or omission, regardless of cause, in
          information from FORCEPU.SH or for any damages (whether direct or
          indirect, consequential, punitive or exemplary).
        </p>
      </section>

      <section id="terms-of-use">
        <Title level={sublevel}>Terms of Use</Title>
        <p>
          Welcome to FORCEPU.SH. These Terms of Use govern your use of the
          FORCEPU.SH Network (the websites of FORCEPU.SH, hereafter referred to
          as “ FORCEPU.SH”), all content, software and services (the “Services”)
          offered through FORCEPU.SH.
        </p>
        <p>
          YOUR AFFIRMATIVE ACT OF USING FORCEPU.SH SIGNIFIES THAT YOU AGREE TO
          THE FOLLOWING TERMS OF USE, AND YOU CONSENT TO THE COLLECTION, USE AND
          DISCLOSURE OF PERSONAL INFORMATION AS DISCLOSED IN THE PRIVACY POLICY.
          IF YOU DO NOT AGREE, DO NOT USE FORCEPU.SH.
        </p>
      </section>

      <section id="terms-changes">
        <Title level={sublevel}>Changes to the Terms of Use</Title>
        <p>
          We may change these Terms of Use at any time. You can review the most
          current version of these terms by clicking on the “Terms of Service
          &amp; Privacy Policy” link located at the bottom of our web pages. You
          are responsible for checking these terms periodically for changes. If
          you continue to use FORCEPU.SH after we post changes to these Terms of
          Use, you are signifying your acceptance of the new terms.
        </p>
      </section>

      <section id="site-changes">
        <Title level={sublevel}>Changes to FORCEPU.SH</Title>
        <p>
          We may discontinue or change any service or feature on FORCEPU.SH at
          any time and without notice.
        </p>
      </section>

      <section id="info-ownership">
        <Title level={sublevel}>
          Ownership of Information; License to use forcepu.sh; Redistribution of
          Data
        </Title>
        <p>
          Unless otherwise noted, all right, title and interest in and to
          FORCEPU.SH, and all information made available through FORCEPU.SH or
          its Services, in all languages, formats and media throughout the
          world, including all copyrights and trademarks therein, are the
          exclusive property of FORCEPU.SH, its affiliates or its Data
          Providers. Any Content on websites (a "Site" or "Sites") that are
          hosted by FORCEPU.SH and/or its affiliates, is owned by or licensed to
          FORCEPU.SH. User acknowledges the Content is protected under United
          States copyright laws. Such Content includes data and prices wholly
          owned by FORCEPU.SH and/or managed by  on behalf of a Site
          or Sites. You may not capture, record, publish, display, create
          derivative works of, republish the Content owned or hosted by
          FORCEPU.SH in whole or in part without consent from FORCEPU.SH or its
          clients.
        </p>
        <p>
          In no event shall any user publish, retransmit, redistribute or
          otherwise reproduce any FORCEPU.SH Content in any format to anyone,
          and no user shall use any FORCEPU.SH Content in or in connection with
          any business or commercial enterprise, including, without limitation,
          any securities, investment, accounting, banking, legal or media
          business or enterprise, without the express written consent of
          FORCEPU.SH. You may use FORCEPU.SH and the Content offered on
          FORCEPU.SH only for personal, non-commercial purposes. You may use
          Content offered for downloading, such as daily data files, for
          personal use only and subject to the rules that accompany that
          particular Content. You may not use any data mining, robots, or
          similar data gathering and extraction tools on the Content, frame any
          portion of FORCEPU.SH or Content, or reproduce, reprint, copy, stre,
          publicly display, broadcast, transmit, modify, translate, port,
          publish, sublicense, assign, transfer, sell, loan, or otherwise
          distribute the Content without our prior written consent. You may not
          circumvent any mechanisms included in the Content for preventing the
          unauthorized reproduction or distribution of the Content.EXCEPT AS
          OTHERWISE EXPRESSLY PERMITTED BY THE PRECEDING PARAGRAPH, YOU AGREE
          NOT TO REPRODUCE, RETRANSMIT, DISSEMINATE, SELL, DISTRIBUTE, PUBLISH,
          BROADCAST OR CIRCULATE ANY OF THE SERVICES OR MATERIALS IN ANY MANNER
          OR FOR ANY PURPOSES (WHETHER PERSONAL OR BUSINESS) WITHOUT THE PRIOR
          EXPRESS WRITTEN CONSENT OF FORCEPU.SH AND/OR THE DATA PROVIDERS. IN
          ADDITION, YOU SHALL NOT, WITHOUT THE PRIOR EXPRESS WRITTEN CONSENT OF
          FORCEPU.SH AND THE RELEVANT DATA PROVIDERS, MAKE COPIES OF ANY OF THE
          SOFTWARE OR DOCUMENTATION THAT MAY BE PROVIDED, ELECTRONICALLY OR
          OTHERWISE, INCLUDING, BUT NOT LIMITED TO, TRANSLATING, DECOMPILING,
          DISASSEMBLING OR CREATING DERIVATIVE WORKS.
        </p>
      </section>

      <section id="third-party-sites">
        <Title level={sublevel}>Third Party Sites and Advertisers</Title>
        <p>
          As a convenience to you, FORCEPU.SH may provide hyperlinks to web
          sites operated by third parties. When you select these hyperlinks you
          will be leaving the FORCEPU.SH site. Because FORCEPU.SH has no control
          over such sites or their content, FORCEPU.SH are not responsible for
          the availability of such external sites or their content, and
          FORCEPU.SH do not adopt, endorse or nor is responsible or liable for
          any such sites or content, including advertising, products or other
          materials, on or available through such sites or resources. Other web
          sites may provide links to the Site or Content with or without our
          authorization. FORCEPU.SH do not endorse such sites and shall not be
          responsible or liable for any links from those sites to the Site or
          Content, or for any content, advertising, products or other materials
          available on or through such other sites, or any loss or damages
          incurred in connection therewith. FORCEPU.SH may, in its sole
          discretion, block links to the Site and Content without prior notice.
        </p>
        <p>
          YOUR USE OF THIRD PARTY WEB SITES AND CONTENT, INCLUDING WITHOUT
          LIMITATION, YOUR USE OF ANY INFORMATION, DATA, ADVERTISING, PRODUCTS,
          OR OTHER MATERIALS ON OR AVAILABLE THROUGH SUCH WEB SITES, IS AT YOUR
          OWN RISK AND IS SUBJECT TO THEIR TERMS OF USE.
        </p>
        <p>
          If you register as a user (a "Member") of any of the features of
          FORCEPU.SH, including the FORCEPU.SH family of newsletters, FORCEPU.SH
          will automatically opt you into our email lists. The FORCEPU.SH email
          lists are an important revenue source for FORCEPU.SH which help pay
          for the upkeep and continued development of FORCEPU.SH. As a Member,
          FORCEPU.SH will look to send you relevant content, some of which are
          advertisements for third party products and services, including
          special offers, webinars, educational booklets, and promotions
          tailored to your perceived interests. From time to time, we may ask
          Members to review and agree to our Terms and Conditions. Upon your
          acceptance, you agree to let FORCEPU.SH add you back to our commercial
          email lists.
        </p>
        <p>
          You can edit your Account Information, including your newsletter
          preferences, at any time. Commercial email communications from
          FORCEPU.SH comes with an unsubscribe link at the bottom for you to
          opt-out of future such marketing communications. You can also email
          FORCEPU.SH at any time and request to be removed, temporarily or
          permanently from one or all of our email lists.
        </p>
        <p>
          FORCEPU.SH does not share your email address with any third party
          advertisers.
        </p>
      </section>

      <section id="content-disclaimer">
        <Title level={sublevel}>Disclaimer Regarding Content</Title>
        <p>
          FORCEPU.SH cannot and does not represent or guarantee that any of the
          information available through the Services or on FORCEPU.SH is
          accurate, reliable, current, complete or appropriate for your needs.
          Various information available through the Services or on FORCEPU.SH
          may be specially obtained by FORCEPU.SH from professional businesses
          or organizations, such as exchanges, news providers, market data
          providers and other content providers, who are believed to be sources
          of reliable information (collectively, the “Data Providers”).
          Nevertheless, due to various factors — including the inherent
          possibility of human and mechanical error — the accuracy,
          completeness, timeliness, results obtained from use, and correct
          sequencing of information available through the Services and Website
          are not and cannot be guaranteed by FORCEPU.SH. Neither FORCEPU.SH nor
          its affiliates make any express or implied warranties (including,
          without limitation, any warranty or merchantability or fitness for a
          particular purpose or use) regarding the Content on FORCEPU.SH. The
          FORCEPU.SH Content is provided to the users "as is." Neither
          FORCEPU.SH nor its affiliates will be liable to any user or anyone
          else for any interruption, inaccuracy, error or omission, regardless
          of cause, in the FORCEPU.SH Content or for any damages (whether direct
          or indirect, consequential, punitive or exemplary).
        </p>
      </section>

      <section id="investment-disclaimer">
        <Title level={sublevel}>
          Disclaimer Regarding Investment Decisions and Trading
        </Title>
        <p>
          Decisions to buy, sell, hold or trade in securities, commodities and
          other investments involve risk and are best made based on the advice
          of qualified financial professionals. Any trading in securities or
          other investments involves a risk of substantial losses. The practice
          of “Day Trading” involves particularly high risks and can cause you to
          lose substantial sums of money. Before undertaking any trading
          program, you should consult a qualified financial professional. Please
          consider carefully whether such trading is suitable for you in light
          of your financial condition and ability to bear financial risks. Under
          no circumstances shall we be liable for any loss or damage you or
          anyone else incurs as a result of any trading or investment activity
          that you or anyone else engages in based on any information or
          material you receive through FORCEPU.SH or our Services.
        </p>
        <p>
          Trading in the financial markets and securities in stocks, bonds,
          exchange traded funds, mutual funds, and money market funds involve
          substantial risk and PARTICIPANTS CAN LOSE A LOT OF MONEY, and thus is
          not appropriate for everyone. You should carefully consider your
          financial condition before trading in these markets, and only
          expendable risk capital should be used.
        </p>
      </section>

      <section id="performance-disclaimer">
        <Title level={sublevel}>
          Disclaimer Regarding Hypothetical Performance Results
        </Title>
        <p>
          Hypothetical performance results have many inherent limitations, some
          of which are mentioned below. No representation is being made that any
          account will or is likely to achieve profits or losses similar to
          those shown. In fact, there are frequently sharp differences between
          hypothetical performance results and actual results subsequently
          achieved by any particular trading program.
        </p>
        <p>
          One of the limitations of hypothetical performance results is that
          they are generally prepared with the benefit of hindsight. In
          addition, hypothetical trading does not involve financial risk and no
          hypothetical trading record can completely account for the impact of
          financial risk in actual trading. For example the ability to withstand
          losses or to adhere to a particular trading program in spite of the
          trading losses are material points, which can also adversely affect
          trading results. There are numerous other factors related to the
          market in general or to the implementation of any specific trading
          program which cannot be fully accounted for in the preparation of
          hypothetical performance results and all of which can adversely affect
          actual trading results.
        </p>
        <p>
          THE SITE AND CONTENT ARE PROVIDED “AS IS”, ANY CONTENT FROM FORCEPU.SH
          PRODUCTS AND SERVICES ARE PROVIDED FOR EDUCATIONAL PURPOSES ONLY AND
          DO NOT CONSTITUTE AS INVESTMENT ADVICE. ANY TRADES PLACED UP UPON
          RELIANCE ON FORCEPU.SH (FORCEPU.SH) SYSTEMS ARE TAKEN AT YOUR OWN RISK
          FOR YOUR OWN ACCOUNT. PAST PERFORMANCE DOES NOT GUARANTEE FUTURE
          RESULTS. WHILE THERE IS GREAT POTENTIAL FOR REWARD TRADING IN THE
          FINANCIAL MARKETS, THERE IS ALSO SUBSTANTIAL RISK OF LOSS IN ALL
          TRADING.
        </p>
        <p>
          YOU MUST DECIDE YOUR OWN SUITABILITY TO PLACE A TRADE OR NOT.
          PERFORMANCE IN THE FINANCIAL MARKETS CAN NEVER BE GUARANTEED.
          FORCEPU.SH AND ANY OF IT’S ASSOCIATE IS NOT A REGISTERED INVESTMENT
          ADVISOR, BROKER, DEALER, OR MEMBER OF ANY ASSOCIATION OR OTHER
          RESEARCH PROVIDERS IN ANY JURISDICTION WHATSOEVER AND ARE NOT
          QUALIFIED TO GIVE FINANCIAL ADVICE.
        </p>
      </section>

      <section id="limitation-of-liability">
        <Title level={sublevel}>Limitation of Liability</Title>
        <p>
          YOUR EXCLUSIVE REMEDY FOR DISSATISFACTION WITH THE SITE AND CONTENT IS
          TO STOP USING THE SITE AND CONTENT. FORCEPU.SH IS NOT LIABLE FOR ANY
          DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL OR PUNITIVE
          DAMAGES, UNDER ANY THEORY OF LIABILITY, INCLUDING WITHOUT LIMITATION,
          DAMAGES FOR LOSS OF PROFITS, USE, DATA, OR LOSS OF OTHER INTANGIBLES.
          IN PARTICULAR, AND WITHOUT LIMITATION, FORCEPU.SH WILL NOT BE LIABLE
          FOR DAMAGES OF ANY KIND RESULTING FROM YOUR USE OF OR INABILITY TO USE
          THE SITE OR CONTENT.
        </p>
        <p>
          While we try to maintain the integrity and security of the Site and
          the servers from which the Site is operated, we do not guarantee that
          the Site or Content is or remains secure, complete or correct, or that
          access to the Site or Content will be uninterrupted or error free. The
          Site and Content may include inaccuracies, errors and materials that
          violate or conflict with these Terms. Additionally, third parties may
          make unauthorized alterations to the Site or Content. If you become
          aware of any unauthorized third party alteration to the Site or
          Content, contact us at
          <NavLink to={'/contact'}>{` ${window.location.host}/contact `}</NavLink>
          with a description of the material(s) at issue and the URL.
        </p>
      </section>

      <section id="trading-signals">
        <Title level={sublevel}>Trading Signals</Title>
        <p>
          ALL SIGNALS are for educational purposes only and are not to be
          construed as an offer to buy or sell securities. By reading this, you
          hereby agree that you will not make actual trades solely based on any
          information, educational alerts or triggers that are provided from
          FORCEPU.SH’s products and services including but not limited to
          content rendered on FORCEPU.SH’s website, email, audio, video and
          text.
        </p>
      </section>

      <section id="registered-users">
        <Title level={sublevel}>Registered Users</Title>
        <p>
          Certain services are available only to registered users of the
          FORCEPU.SH website and require you to sign in with a username and
          password to use them. If you register as a user (a “Member”) of any of
          the features of FORCEPU.SH, during the registration process you may be
          prompted to click a “Register Now,” “Submit” or similar button; your
          clicking on such button will further confirm your agreement to be
          legally bound by these Terms and Conditions.
        </p>
        <p>
          In consideration of your use of the FORCEPU.SH website, you represent
          that you are of legal age to form a binding contract and are not a
          person barred from receiving FORCEPU.SH Services under the laws of the
          United States or other applicable jurisdiction. You also agree to: (a)
          provide true, accurate, current and complete information about
          yourself as prompted by the FORCEPU.SH’s registration form (the
          “Registration Data”) and (b) maintain and promptly update the
          Registration Data to keep it true, accurate, current and complete. If
          you provide any information that is untrue, inaccurate, not current or
          incomplete, or FORCEPU.SH has reasonable grounds to suspect that such
          information is untrue, inaccurate, not current or incomplete,
          FORCEPU.SH has the right to suspend or terminate your account and
          refuse any and all current or future use of the FORCEPU.SH Services
          (or any portion thereof).
        </p>
      </section>

      <section id="rules-of-conduct">
        <Title level={sublevel}>Rules of Conduct</Title>
        <p>
          Your use of the Site and Content is conditioned on your compliance
          with the rules of conduct set forth here. You will not:
        </p>
        <ul>
          <li>
            Use the Site or Content for any fraudulent or unlawful purpose.
          </li>
          <li>
            Interfere with or disrupt the operation of the Site or Content or
            the servers or networks used to make the Site and Content available;
            or violate any requirements, procedures, policies or regulations of
            such networks.
          </li>
          <li>
            Restrict or inhibit any other person from using the Site or Content
            (including without limitation by hacking or defacing any portion of
            the Site or Content).
          </li>
          <li>
            Use the Site or Content to advertise or offer to sell or buy any
            goods or services without FORCEPU.SH’s express prior written
            consent.
          </li>
          <li>
            Reproduce, duplicate, copy, sell, resell or otherwise exploit for
            any commercial purposes, any portion of, use of, or access to the
            Site or Content.
          </li>
          <li>
            Modify, adapt, reverse engineer, de-compile/disassemble any part of
            the Site or Content.
          </li>
          <li>
            Remove any copyright, trademark or other proprietary rights notice
            from the Site or materials originating from the Site or Content.
          </li>
          <li>
            Frame or mirror any part of the Site or Content without FORCEPU.SH’s
            express prior written consent.
          </li>
          <li>
            Create a database by systematically downloading and storing Content.
          </li>
          <li>
            Use any robot, spider, site search/retrieval application or other
            manual or automatic device to retrieve, index, “scrape,” “data mine”
            or in any way gather Content or reproduce or circumvent the
            navigational structure or presentation of the Site without Company’s
            express prior written consent.
          </li>
        </ul>
      </section>

      <section id="termination">
        <Title level={sublevel}>Termination</Title>
        <p>
          FORCEPU.SH, in its sole discretion, may terminate your access to or
          use of the Site and Content, at any time and for any reason. Your
          access to or use of the Site and Content may be terminated without
          notice. FORCEPU.SH shall not be liable to you or any third party for
          any termination of your access to the Site or Content, or to any such
          information or files, and shall not be required to make such
          information or files available to you after any such termination.
        </p>
        <p>
          You agree that FORCEPU.SH may, without prior notice, immediately
          terminate, limit your access to or suspend your FORCEPU.SH account,
          any associated email address, and access to the FORCEPU.SH Services.
          Cause for such termination, limitation of access or suspension shall
          include, but not be limited to, (a) breaches or violations of the
          Terms of Use or other incorporated agreements or guidelines, (b)
          requests by law enforcement or other government agencies, (c)
          discontinuance or material modification to the FORCEPU.SH Services (or
          any part thereof), (d) unexpected technical or security issues or
          problems, (e) extended periods of inactivity, (f) engagement by you in
          fraudulent or illegal activities, (g) and/or abusive correspondence
          with FORCEPU.SH. Further, you agree that all terminations, limitations
          of access and suspensions for cause shall be made in FORCEPU.SH’s sole
          discretion and that FORCEPU.SH shall not be liable to you or any third
          party for any termination of your account, any associated email
          address, or access to the FORCEPU.SH Services.
        </p>
        <p>
          You may terminate your FORCEPU.SH account, any associated email
          address and access to the FORCEPU.SH Services by submitting such
          termination request to FORCEPU.SH. Members can request deactivation or
          deletion of their FORCEPU.SH account on the Account page through the
          “Contact Support” link.
        </p>
      </section>

      <section id="access-and-security">
        <Title level={sublevel}>Access and Security</Title>
        <p>
          You accept responsibility for the confidentiality and use of any user
          name and email address that you may register for your access to and
          use of the Services. You are responsible for maintaining the
          confidentiality of the password and account and are fully responsible
          for all activities that occur under your password or account. You
          agree to (a) immediately notify FORCEPU.SH of any unauthorized use of
          your password or account or any other breach of security, and (b)
          ensure that you exit from your account at the end of each session.
          FORCEPU.SH cannot and will not be liable for any loss or damage
          arising from your failure to comply.
        </p>
      </section>

      <section id="feedback">
        <Title level={sublevel}>Feedback to FORCEPU.SH</Title>
        <p>
          By submitting ideas, suggestions, documents, and/or proposals to
          FORCEPU.SH through its contact or feedback webpages, you acknowledge
          and agree that: (a) your Contributions do not contain confidential or
          proprietary information; (b) FORCEPU.SH is not under any obligation of
          confidentiality, express or implied, with respect to the
          Contributions; (c) FORCEPU.SH shall be entitled to use or disclose (or
          choose not to use or disclose) such Contributions for any purpose, in
          any way, in any media worldwide; (d) FORCEPU.SH may have something
          similar to the Contributions already under consideration or in
          development; (e) your Contributions automatically become the property
          of FORCEPU.SH without any obligation of FORCEPU.SH to you; and (f) you
          are not entitled to any compensation or reimbursement of any kind from
          FORCEPU.SH under any circumstances.
        </p>
      </section>

      <section id="indemnity">
        <Title level={sublevel}>Indemnity</Title>
        <p>
          You agree to indemnify and hold FORCEPU.SH and its subsidiaries,
          affiliates, officers, agents, employees, partners and licensors
          harmless from any claim or demand, including reasonable attorneys’
          fees, made by any third party due to or arising out of Content you
          submit, post, transmit, modify or otherwise make available through the
          FORCEPU.SH Services, your use of the FORCEPU.SH Services, your
          connection to the FORCEPU.SH Services, your violation of the Terms of
          Use, or your violation of any rights of another.
        </p>
      </section>

      <section id="billing-cancellation-and-refunds">
        <Title level={sublevel}>
          FORCEPU.SH Subscription/Billing, Cancellation, and Refund
          Policy
        </Title>
        <p>
          Unless otherwise stated, all subscriptions are automatically renewing.
        </p>
        <p>
          To cancel your FORCEPU.SH subscription, please log in to forcepu.sh
          and click the “Manage Subscription” link on the Subscription page.
        </p>
        <p>
          FORCEPU.SH does not offer partial cancellations. Upon cancellation
          your service will remain active through the end of your paid term.
        </p>
      </section>

      <section id="service-interruption">
        <Title level={sublevel}>Service Interruption</Title>
        <p>
          In the event of an interruption of service lasting five consecutive
          days or longer, FORCEPU.SH agrees to offer applicable subscribers the
          following compensation options:
        </p>
        <ul>
          <li>
            a complementary extension of access to their FORCEPU.SH algorithm's
            signals for a period of time equaled to the interruption period
          </li>
          <li>
            a refund pro-rated for the remainder of the subscription period.
            Choosing this option will cancel the subscriber's existing
            subscription for the remainder of the subscription period.
          </li>
        </ul>
      </section>

      <section id="algorithm-discontinuation">
        <Title level={sublevel}>Algorithm Discontinuation</Title>
        <p>
          In the event of the discontinuation of signals from a FORCEPU.SH
          algorithm, FORCEPU.SH agrees to provide appropriate notice to all
          subscribers via FORCEPU.SH communication channels, e.g. email,
          encouraging them to take action. The discontinued algorithm will no
          longer accept new subscribers, and continue publishing signals until
          all existing subscribers' subscription periods have expired, at which
          point signal publishing will stop.
        </p>
        <p>
          Alternatively, FORCEPU.SH offers applicable subscribers the following
          compensation options:
        </p>
        <ul>
          <li>
            a refund pro-rated for the remainder of the subscription period.
            Choosing this option will cancel the subscriber's existing
            subscription for the remainder of the subscription period.
          </li>
        </ul>
      </section>

      <section id="disputes">
        <Title level={sublevel}>Disputes</Title>
        <p>
          ALL DISPUTES ARISING UNDER THIS AGREEMENT SHALL BE LITIGATED BEFORE A
          COURT LOCATED IN FLORIDA, USA, WITHOUT REGARD TO CHOICE OF LAW
          PRINCIPLES. ANY ACTION, PROCEEDING, OR LITIGATION BROUGHT BY A PARTY
          PURSUANT TO THIS AGREEMENT OR ANY BREACH THEREOF MUST BE COMMENCED
          WITHIN ONE (1) YEAR AFTER THE CLAIM OR CAUSE OF ACTION AROSE, WHETHER
          OR NOT THE PARTY HAD ANY KNOWLEDGE OR NOTICE THEREOF. THE PARTIES
          AGREE THAT IN ANY SUCH DISPUTE OR SUBSEQUENT LEGAL ACTION, THEY WILL
          ONLY ASSERT CLAIMS IN AN INDIVIDUAL (NON-CLASS, NONREPRESENTATIVE)
          BASIS, AND THAT THEY WILL NOT SEEK OR AGREE TO SERVE AS A NAMED
          REPRESENTATIVE IN A CLASS ACTION OR SEEK RELIEF ON BEHALF OF THOSE
          OTHER THAN THEMSELVES. FORCEPU.SH WILL BE ENTITLED TO RECOVER ITS
          COURT COSTS AND ATTORNEYS' FEES AND EXPENSES INCURRED IN PROVING ANY
          BREACH BY YOU OF ANY TERMS OF USE.
        </p>
      </section>

      <section id="site-content-warranty">
        <Title level={sublevel}>SITE AND CONTENT NOT WARRANTED</Title>
        <p>
          THE SITE AND CONTENT ARE PROVIDED “AS IS” AND WITHOUT WARRANTIES OF
          ANY KIND. YOU BEAR ALL RISKS ASSOCIATED WITH THE USE OF THE SITE AND
          CONTENT, INCLUDING WITHOUT LIMITATION, ANY RELIANCE ON THE ACCURACY,
          COMPLETENESS OR USEFULNESS OF ANY CONTENT AVAILABLE ON THE SITE.
          FORCEPU.SH AND ITS EMPLOYEES, OFFICERS, DIRECTORS, , PARTNERS, AGENTS,
          REPRESENTATIVES, SUPPLIERS AND SERVICE PROVIDERS, DISCLAIM ALL
          WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ALL
          WARRANTIES OF TITLE, NON-INFRINGEMENT, ACCURACY, COMPLETENESS,
          USEFULNESS, MERCHANTABILITY, AND FITNESS FOR A PARTICULAR USE, AND
          WARRANTIES THAT MAY ARISE FROM COURSE OF DEALING/PERFORMANCE OR USAGE
          OF TRADE.
        </p>
      </section>
    </div>
  );
};

TOSPage.displayName = "TOS";

export default TOSPage;
