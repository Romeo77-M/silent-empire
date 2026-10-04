import React, { useState, useCallback, useEffect } from 'react';
import type { EnhancedTitanSchema } from './types';
import { generateTitanSummary } from './services/titanService';
import { fetchLatestFilingForTicker } from './services/edgarService';
import * as cache from './services/cacheService';
import * as historyService from './services/historyService';
import { exportAsPDF } from './services/pdfService';
import { trackEvent } from './services/analyticsService';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { SummaryList } from './components/SummaryList';
import { ComparisonView } from './components/ComparisonView';
import { ChartIntelligencePage } from './modules/chart-intelligence/ChartIntelligencePage';
import { Loader } from './components/Loader';

type View = 'landing' | 'list' | 'comparison' | 'chart';

const App: React.FC = () => {
  const [summaries, setSummaries] = useState<EnhancedTitanSchema[]>(() => historyService.loadSummaries());
  const [selectedSummaryIds, setSelectedSummaryIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>(() => (historyService.loadSummaries().length > 0 ? 'list' : 'landing'));
  const [chartTicker, setChartTicker] = useState<string>(() => historyService.loadSummaries()[0]?.meta.ticker || 'AAPL');

  const recentChartTickers = Array.from(new Set(summaries.map(summary => summary.meta.ticker)))
    .filter(ticker => ticker !== chartTicker)
    .slice(0, 2);

  useEffect(() => {
    historyService.saveSummaries(summaries);
  }, [summaries]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedSummaryData = urlParams.get('summary');

    if (sharedSummaryData) {
      try {
        const binary = atob(decodeURIComponent(sharedSummaryData));
        const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
        const decodedData = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(decodedData);
        const summary = historyService.normalizeSummary(parsed);
        if (!summary) throw new Error('Invalid shared summary format.');

        summary.id = `${summary.meta.ticker}-${new Date().getTime()}`;

        setSummaries(prev => {
          // Filter out any previous summaries for the same ticker to avoid duplicates.
          const otherSummaries = prev.filter(s => s.meta.ticker !== summary.meta.ticker);
          // Add the new shared summary to the top of the list.
          return [summary, ...otherSummaries];
        });
        setChartTicker(summary.meta.ticker);
        setView('list');
        
        window.history.replaceState({}, document.title, window.location.pathname);

      } catch (e) {
        console.error("Failed to parse shared summary data from URL:", e);
        setError("The shared summary link appears to be corrupted or invalid.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleAnalysis = useCallback(async ({ ticker }: { ticker: string; }) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!/^[A-Z0-9.-]{1,15}$/.test(ticker)) {
        throw new Error('Invalid ticker format.');
      }
      
      // Fetch SEC metadata first so cached AI output is tied to the exact filing, not just the ticker.
      const filing = await fetchLatestFilingForTicker(ticker);
      const cacheKey = `summary:${ticker}:${filing.accessionNumber}`;
      const cachedSummary = cache.get<EnhancedTitanSchema>(cacheKey);
      const normalizedCachedSummary = cachedSummary ? historyService.normalizeSummary(cachedSummary) : null;
      if (normalizedCachedSummary) {
          setSummaries(prev => [normalizedCachedSummary, ...prev.filter(s => s.meta.ticker !== ticker)]);
          setChartTicker(normalizedCachedSummary.meta.ticker);
          setView('list');
          trackEvent('analyze_ticker', { ticker: ticker, source: 'filing_cache' });
          return;
      }

      const result = await generateTitanSummary({ ticker, filingText: filing.text, filingIdentity: filing.accessionNumber, filingMetadata: { companyName: filing.companyName, formType: filing.formType, filingDate: filing.filingDate, reportDate: filing.reportDate } });

      const newSummary: EnhancedTitanSchema = {
        id: `${result.meta.ticker}-${new Date().getTime()}`,
        meta: {
            ...result.meta,
            file_name: `Source: ${filing.formType} Filing`,
            filingUrl: filing.url,
            filing_date: filing.filingDate || result.meta.filing_date,
            accessionNumber: filing.accessionNumber,
            reportDate: filing.reportDate,
            accession_number: filing.accessionNumber,
            report_date: filing.reportDate || 'not_available'
        },
        perspectives: result.perspectives
      };

      cache.set(cacheKey, newSummary, 10080); // Reuse this exact filing analysis for 7 days
      setSummaries(prev => [newSummary, ...prev.filter(s => s.meta.ticker !== newSummary.meta.ticker)]);
      setChartTicker(newSummary.meta.ticker);
      setView('list');
      trackEvent('analyze_ticker', { ticker: ticker, source: 'api' });

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Analysis failed';
      trackEvent('analysis_error', { ticker: ticker, error: errorMessage });

      if (errorMessage.includes('API Configuration Error')) {
        setError(`🔧 ${errorMessage}`);
      } else if (errorMessage.includes('Invalid ticker format')) {
          setError('❌ Invalid ticker format. Enter a valid symbol such as AAPL, TSLA, or BRK.B.');
      } else if (errorMessage.includes('API')) {
          setError('⚠️ Service temporarily unavailable. Please try again in a moment.');
      } else if (errorMessage.includes('filing could be found')) {
          setError(`❌ No recent 10-K or 10-Q filing could be found for ${ticker}.`);
      } else {
          setError('❌ Unable to analyze this ticker. It may be invalid or not publicly traded.');
      }
      setView('landing');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleReset = () => {
    // Non-destructive: just goes back to landing to add a new ticker
    setView('landing');
  }
  
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire analysis history? This action cannot be undone.')) {
        setSummaries([]);
        setSelectedSummaryIds(new Set());
        setError(null);
        setIsLoading(false);
        setView('landing');
    }
  }

  const handleToggleSelection = (id: string) => {
    setSelectedSummaryIds(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        return newSelection;
    });
  };

  const handleExportPDF = async (element: HTMLDivElement | null, summary: EnhancedTitanSchema) => {
    if (!element) return;

    setIsExporting(true);
    try {
        await exportAsPDF(element, `Silent_Empire_Summary_${summary.meta.ticker}.pdf`);
        trackEvent('export_pdf', { ticker: summary.meta.ticker });
    } catch (error) {
        console.error("Failed to export PDF:", error);
        trackEvent('export_pdf_error', { ticker: summary.meta.ticker });
    } finally {
        setIsExporting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) return <Loader />;
    
    switch (view) {
      case 'landing':
        return (
          <>
            {error && (
              <div className="mb-8 text-center p-6 bg-risk-red/10 border border-risk-red rounded-lg max-w-2xl mx-auto animate-fade-in">
                <h3 className="font-serif text-xl text-risk-red">Analysis Error</h3>
                <p className="mt-2 text-gray-300">{error}</p>
              </div>
            )}
            <LandingPage onAnalyze={handleAnalysis} isLoading={isLoading} />
          </>
        );
      case 'list':
        return (
          <SummaryList
            summaries={summaries}
            selectedSummaryIds={selectedSummaryIds}
            onToggleSelection={handleToggleSelection}
            onExportPDF={handleExportPDF}
            isExporting={isExporting}
            onClearAll={handleClearAll}
          />
        );
      case 'comparison':
        const selectedSummaries = summaries.filter(s => selectedSummaryIds.has(s.id));
        return <ComparisonView summaries={selectedSummaries} />;
      case 'chart':
        return <ChartIntelligencePage initialTicker={chartTicker} recentTickers={recentChartTickers} onTickerChange={setChartTicker} />;
      default:
        return <LandingPage onAnalyze={handleAnalysis} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-base-graphite text-gray-200">
      <Header 
        onNavigate={setView}
        currentView={view}
        onReset={handleReset}
        selectedCount={selectedSummaryIds.size}
        hasSummaries={summaries.length > 0}
      />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-xs text-gray-500">
        Engineered by RDV web solutions, Empire Systems Division. © {new Date().getFullYear()} Silent Empire Command.
      </footer>
    </div>
  );
};

export default App;