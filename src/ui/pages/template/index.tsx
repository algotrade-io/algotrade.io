import template from "./index.html?raw"
import "./index.module.less";


const TemplatePage = () => {
  return <div
    style={{ padding: '16px', background: 'white', height: '100%', width: '100%' }}
    dangerouslySetInnerHTML={{ __html: template }}
  />;
};

TemplatePage.displayName = "Template";

export default TemplatePage;
