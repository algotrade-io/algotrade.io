// Type declarations for external libraries without @types packages

declare module 'plotly.js-dist-min' {
  export * from 'plotly.js';
}

declare module 'react-plotly.js/factory' {
  import Plotly from 'plotly.js-dist-min';
  
  interface PlotlyFigure {
    data: Partial<Plotly.Data>[];
    layout: Partial<Plotly.Layout>;
    frames?: Partial<Plotly.Frame>[];
  }

  interface PlotParams {
    data: Partial<Plotly.Data>[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: PlotlyFigure, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: PlotlyFigure, graphDiv: HTMLElement) => void;
    onPurge?: (figure: PlotlyFigure, graphDiv: HTMLElement) => void;
    onError?: (err: Error) => void;
  }
  
  function createPlotlyComponent(Plotly: typeof import('plotly.js')): React.ComponentType<PlotParams>;
  export default createPlotlyComponent;
}

declare module 'swagger-ui-react' {
  interface SwaggerRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
  }

  interface SwaggerResponse {
    ok: boolean;
    status: number;
    headers: Record<string, string>;
    body: string;
    text?: string;
  }

  interface SwaggerUIProps {
    url?: string;
    spec?: object;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    displayOperationId?: boolean;
    filter?: boolean | string;
    persistAuthorization?: boolean;
    displayRequestDuration?: boolean;
    onComplete?: (ui: { preauthorizeApiKey?: (key: string, value: string) => void }) => void;
    requestInterceptor?: (request: SwaggerRequest) => SwaggerRequest;
    responseInterceptor?: (response: SwaggerResponse) => SwaggerResponse;
  }
  
  const SwaggerUI: React.ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}

declare module 'styled-components' {
  import * as styledComponents from 'styled-components/dist/styled-components.cjs';
  export default styledComponents.default;
  export * from 'styled-components/dist/styled-components.cjs';
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
