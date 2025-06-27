
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Mostrar toast de error
    toast.error('Se ha producido un error inesperado', {
      description: error.message,
      duration: 5000
    });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Se ha producido un error</h3>
                    <p className="text-sm mt-1">
                      {this.state.error?.message || 'Error desconocido'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={this.handleReset}
                      variant="outline"
                      size="sm"
                    >
                      Intentar de nuevo
                    </Button>
                    <Button 
                      onClick={this.handleReload}
                      variant="default"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Recargar página
                    </Button>
                  </div>

                  {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">Detalles técnicos</summary>
                      <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                        {this.state.error?.stack}
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
