import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Bangla Bazar caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>
            <h2 className="text-xl font-bold text-slate-900">পেজটি রিলোড হচ্ছে</h2>
            <p className="text-xs text-slate-500">
              অনুগ্রহ করে নিচের বাটনে চাপ দিয়ে পেজটি রিফ্রেশ করুন।
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                try {
                  if (typeof window !== 'undefined' && window.location && typeof window.location.reload === 'function') {
                    window.location.reload();
                  }
                } catch (_) {}
              }}
              className="w-full py-3 bg-[#003580] hover:bg-[#002860] text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              পেজ রিফ্রেশ করুন
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
