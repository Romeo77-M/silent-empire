
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { detectPatterns } from './SmartPatternDetector';
import { ChartOverlayTips } from './ChartOverlayTips';
import { PatternExplanationList } from './PatternExplanationList';
import { fetchDailyChartData } from '../../services/marketDataService';
import type { CandlestickData } from '../../types';

const ChartLoader: React.FC = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-graphite/50 backdrop-blur-sm z-10">
        <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full border-2 border-accent-cyan/20"></div>
            <div className="absolute w-16 h-16 rounded-full border-t-2 border-accent-cyan animate-spin"></div>
        </div>
        <p className="mt-4 text-accent-cyan">Fetching Market Data...</p>
    </div>
);

const ChartError: React.FC<{ message: string }> = ({ message }) => (
     <div className="absolute inset-0 flex flex-col items-center justify-center bg-risk-red/10 text-risk-red p-4 rounded-lg">
        <h4 className="font-semibold text-lg">Data Unavailable</h4>
        <p className="text-sm text-center max-w-sm">{message}</p>
    </div>
);


export const ChartIntelligencePage: React.FC = () => {
  const svgRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [activeTicker, setActiveTicker] = useState('AAPL');
  const [hoveredPattern, setHoveredPattern] = useState<string | null>(null);
  
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(true);
  const [chartError, setChartError] = useState<string | null>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const margin = { top: 20, right: 70, bottom: 40, left: 70 };

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
        if (entries[0] && entries[0].contentRect.width > 0) {
            const newWidth = entries[0].contentRect.width;
            setDimensions({
                width: newWidth,
                height: newWidth * 0.55, // Maintain aspect ratio
            });
        }
    });

    if (containerRef.current) {
        observer.observe(containerRef.current);
    }

    return () => {
        if (containerRef.current) {
            observer.unobserve(containerRef.current);
        }
    };
  }, []);
  
  // This effect fetches data when the ticker changes
  useEffect(() => {
    const loadChartData = async () => {
        setIsChartLoading(true);
        setChartError(null);
        setPatterns([]);
        try {
            const data = await fetchDailyChartData(activeTicker);
            // Get the last 100 trading days for a cleaner chart
            setChartData(data.slice(-100));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            if (errorMessage.includes('API Configuration Error')) {
                setChartError(`🔧 ${errorMessage} Please configure it in your environment.`);
            } else {
                 setChartError(errorMessage);
            }
            setChartData([]);
        } finally {
            setIsChartLoading(false);
        }
    };
    loadChartData();
  }, [activeTicker]);


  // This effect finds patterns when data changes
  useEffect(() => {
      if (!chartData || chartData.length === 0 || !dimensions.width) return;

      const x = d3.scaleBand()
        .domain(chartData.map(d => d.date))
        .range([margin.left, dimensions.width - margin.right])
        .padding(0.3);
        
      const yMin = d3.min(chartData, d => d.low);
      const yMax = d3.max(chartData, d => d.high);
      if (yMin === undefined || yMax === undefined) return;
      
      const y = d3.scaleLinear()
        .domain([yMin * 0.98, yMax * 1.02])
        .range([dimensions.height - margin.bottom, margin.top]);

      const found = detectPatterns(chartData);
      setPatterns(found.map(f => ({ ...f, x: x(chartData[f.index].date)!, y: y(chartData[f.index].high) - 20 })));
  }, [chartData, dimensions.width, dimensions.height]);


  // This effect draws and updates the chart
  useEffect(() => {
    if (!dimensions.width || !dimensions.height || chartData.length === 0) return;

    const data = chartData;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([margin.left, dimensions.width - margin.right])
      .padding(0.3);

    const yMin = d3.min(data, d => d.low);
    const yMax = d3.max(data, d => d.high);
    if (yMin === undefined || yMax === undefined) return;

    const y = d3.scaleLinear()
      .domain([yMin * 0.98, yMax * 1.02])
      .range([dimensions.height - margin.bottom, margin.top]);

    // Axes
    const xAxis = d3.axisBottom(x)
      .tickValues(x.domain().filter((d, i) => i % Math.ceil(data.length / 10) === 0)); // Show ~10 ticks
    svg.append('g')
      .attr('transform', `translate(0,${dimensions.height - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#555');

    const yAxis = d3.axisLeft(y).ticks(8);
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .attr('color', '#555');

    // Grid lines
    svg.append('g').attr('class', 'grid')
      .attr('transform', `translate(0, ${dimensions.height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(-(dimensions.height-margin.top-margin.bottom)).tickFormat(() => ''))
      .selectAll('line').attr('stroke', 'rgba(78,227,227,0.05)');

    svg.append('g').attr('class', 'grid')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).tickSize(-(dimensions.width-margin.left-margin.right)).tickFormat(() => ''))
      .selectAll('line').attr('stroke', 'rgba(78,227,227,0.05)');

    const hoveredIndices = hoveredPattern 
        ? patterns.filter(p => p.pattern === hoveredPattern).map(p => p.index) 
        : [];

    // Candlesticks
    svg.selectAll('rect.candle')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'candle')
      .attr('x', d => x(d.date)!)
      .attr('y', d => y(Math.max(d.open, d.close)))
      .attr('width', x.bandwidth())
      .attr('height', d => Math.abs(y(d.open) - y(d.close)) || 1)
      .attr('fill', d => (d.close > d.open ? '#4EE3E3' : '#EAC66F'))
      .attr('opacity', (d, i) => (hoveredPattern === null || hoveredIndices.includes(i)) ? 1 : 0.4)
      .attr('stroke', (d, i) => hoveredIndices.includes(i) ? '#EAD480' : 'none')
      .attr('stroke-width', (d, i) => hoveredIndices.includes(i) ? 2 : 0)
      .style('transition', 'all 0.2s ease-in-out');

    // Wicks
    svg.selectAll('line.wick')
      .data(data)
      .enter()
      .append('line')
      .attr('class', 'wick')
      .attr('x1', d => x(d.date)! + x.bandwidth() / 2)
      .attr('x2', d => x(d.date)! + x.bandwidth() / 2)
      .attr('y1', d => y(d.high))
      .attr('y2', d => y(d.low))
      .attr('stroke', d => (d.close > d.open ? '#4EE3E3' : '#EAC66F'))
      .attr('opacity', (d, i) => (hoveredPattern === null || hoveredIndices.includes(i)) ? 1 : 0.4)
      .style('transition', 'opacity 0.2s ease-in-out');

  }, [chartData, dimensions, patterns, hoveredPattern]);
  
  const getTickerClass = (ticker: string) => {
    return activeTicker === ticker ? 'bg-accent-cyan text-base-graphite' : 'bg-gray-800 text-gray-400 hover:bg-gray-700';
  }

  return (
    <div className="p-6 card rounded-lg animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-serif text-accent-cyan">Chart Intelligence</h1>
            <div className="flex space-x-2">
                <button onClick={() => setActiveTicker('AAPL')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${getTickerClass('AAPL')}`}>AAPL</button>
                <button onClick={() => setActiveTicker('TSLA')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${getTickerClass('TSLA')}`}>TSLA</button>
                <button onClick={() => setActiveTicker('NVDA')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${getTickerClass('NVDA')}`}>NVDA</button>
            </div>
        </div>
      <div ref={containerRef} className="relative w-full min-h-[300px]">
        {isChartLoading && <ChartLoader />}
        {chartError && <ChartError message={chartError} />}
        
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
        
        {!isChartLoading && !chartError && patterns.map((p, i) => (
          <ChartOverlayTips 
            key={i} 
            pattern={p.pattern} 
            x={p.x} 
            y={p.y}
            onMouseEnter={() => setHoveredPattern(p.pattern)}
            onMouseLeave={() => setHoveredPattern(null)}
          />
        ))}
      </div>
      {!isChartLoading && !chartError && (
       <PatternExplanationList 
          patterns={patterns} 
          hoveredPattern={hoveredPattern}
          setHoveredPattern={setHoveredPattern}
        />
      )}
    </div>
  );
};
