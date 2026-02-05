// Type declarations for external libraries without @types packages

declare module 'plotly.js-dist-min' {
  export * from 'plotly.js';
}

declare module 'react-plotly.js/factory' {
  import Plotly from 'plotly.js-dist-min';
  import { Component } from 'react';
  
  interface PlotParams {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    style?: React.CSSProperties;
    className?: string;
    onInitialized?: (figure: any, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: any, graphDiv: HTMLElement) => void;
    onPurge?: (figure: any, graphDiv: HTMLElement) => void;
    onError?: (err: Error) => void;
  }
  
  function createPlotlyComponent(Plotly: any): React.ComponentType<PlotParams>;
  export default createPlotlyComponent;
}

declare module 'swagger-ui-react' {
  import { Component } from 'react';
  
  interface SwaggerUIProps {
    url?: string;
    spec?: object;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    displayOperationId?: boolean;
    filter?: boolean | string;
    persistAuthorization?: boolean;
  }
  
  const SwaggerUI: React.ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}

declare module '@/aws-exports' {
  const awsmobile: {
    aws_project_region: string;
    aws_cognito_region: string;
    aws_user_pools_id: string;
    aws_user_pools_web_client_id: string;
    oauth: object;
    aws_cognito_username_attributes: string[];
    aws_cognito_social_providers: string[];
    aws_cognito_signup_attributes: string[];
    aws_cognito_mfa_configuration: string;
    aws_cognito_mfa_types: string[];
    aws_cognito_password_protection_settings: object;
    aws_cognito_verification_mechanisms: string[];
  };
  export default awsmobile;
}
