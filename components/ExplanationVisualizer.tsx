
import React, { useRef, useEffect } from 'react';
import type { ExplanationStep } from '../types';
import * as d3 from 'd3';

interface ExplanationVisualizerProps {
  step: ExplanationStep;
}

const PADDING = { top: 40, right: 20, bottom: 20, left: 20 };
const ROW_HEIGHT = 30;
const HEADER_HEIGHT = 30;
const CELL_WIDTH = 100;
const GROUP_SPACING = 20;
const TRANSITION_DURATION = 750;

const ExplanationVisualizer: React.FC<ExplanationVisualizerProps> = ({ step }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  // Use a ref to remember the previous step for more complex transitions
  const prevStepRef = useRef<ExplanationStep | undefined>(undefined);

  useEffect(() => {
    if (!svgRef.current || !step) return;

    const { data, title, groups } = step;
    const { columns, rows } = data;
    const svg = d3.select(svgRef.current);
    const prevStep = prevStepRef.current;

    const container = d3.select(svgRef.current.parentElement);
    const width = (container.node() as HTMLElement)?.clientWidth || 600;
    const height = (container.node() as HTMLElement)?.clientHeight || 400;

    svg.attr('width', width).attr('height', height);
    const g = svg.selectAll<SVGGElement, unknown>('g.main-group').data([null]);
    const gEnter = g.enter().append('g').attr('class', 'main-group');
    const gMerge = g.merge(gEnter).attr('transform', `translate(${PADDING.left},${PADDING.top})`);
    
    // --- Title ---
    gMerge.selectAll("text.vis-title").data([title])
      .join("text")
      .attr("class", "vis-title font-bold text-lg fill-slate-200")
      .attr('x', (width - PADDING.left - PADDING.right) / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .text(d => d);
      
    // --- Data Table Group ---
    const tableWidth = columns.length * CELL_WIDTH;
    const tableX = (width - PADDING.left - PADDING.right - tableWidth) / 2;
    
    const table = gMerge.selectAll<SVGGElement, unknown>('g.table-group').data([null]);
    const tableEnter = table.enter().append('g').attr('class', 'table-group');
    const tableMerge = table.merge(tableEnter).attr('transform', `translate(${tableX}, 30)`);

    // --- Headers ---
    const headers = tableMerge.selectAll<SVGGElement, string>('g.header')
      .data(columns, d => d)
      .join('g')
      .attr('class', 'header')
      .attr('transform', (d, i) => `translate(${i * CELL_WIDTH}, 0)`);

    headers.selectAll('rect').data(d => [d]).join('rect')
      .attr('width', CELL_WIDTH - 1)
      .attr('height', HEADER_HEIGHT)
      .attr('fill', '#334155');

    headers.selectAll('text').data(d => [d]).join('text')
      .attr('x', CELL_WIDTH / 2)
      .attr('y', HEADER_HEIGHT / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text(d => d)
      .attr('class', 'font-semibold fill-cyan-300');
    
    // --- Row Logic ---
    const rowSelection = tableMerge.selectAll<SVGGElement, string[]>('g.row')
        .data(rows, (d: string[]) => d[0]);

    // ** EXIT **
    const exitSelection = rowSelection.exit();
    if (title.includes('Aggregation') && prevStep?.title.includes('Grouping') && prevStep.groups) {
        const groupYPositions: { [key: string]: number } = {};
        let yCursor = HEADER_HEIGHT + 5;
        prevStep.groups.forEach(group => {
            const numRows = group.indices.length;
            const groupHeight = numRows * ROW_HEIGHT;
            groupYPositions[group.key] = yCursor + groupHeight / 2 - ROW_HEIGHT / 2;
            yCursor += groupHeight + GROUP_SPACING;
        });
        
        exitSelection.transition().duration(TRANSITION_DURATION)
            .attr('transform', d => `translate(0, ${groupYPositions[d[prevStep.data.columns.indexOf('Category')]]})`)
            .attr('opacity', 0)
            .remove();
    } else {
        exitSelection.transition().duration(TRANSITION_DURATION)
            .attr('opacity', 0)
            .remove();
    }

    // ** ENTER **
    const enterSelection = rowSelection.enter().append('g').attr('class', 'row').attr('opacity', 0);

    // Add cells to entering rows
    const cellsEnter = enterSelection.selectAll('g.cell')
        .data(d => d)
        .join('g')
        .attr('class', 'cell')
        .attr('transform', (d, i) => `translate(${i * CELL_WIDTH}, 0)`);

    cellsEnter.append('rect')
        .attr('width', CELL_WIDTH - 1)
        .attr('height', ROW_HEIGHT - 1)
        .attr('fill', '#1e293b')
        .attr('stroke', '#334155');

    cellsEnter.append('text')
        .attr('x', CELL_WIDTH / 2)
        .attr('y', ROW_HEIGHT / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .text(d => d)
        .attr('class', 'fill-slate-200');

    // Set initial position for entering rows
    if (title.includes('Aggregation') && prevStep?.title.includes('Grouping') && prevStep.groups) {
        const groupYPositions: { [key: string]: number } = {};
        let yCursor = HEADER_HEIGHT + 5;
        prevStep.groups.forEach(group => {
            const numRows = group.indices.length;
            const groupHeight = numRows * ROW_HEIGHT;
            groupYPositions[group.key] = yCursor + groupHeight / 2 - ROW_HEIGHT / 2;
            yCursor += groupHeight + GROUP_SPACING;
        });

        enterSelection.attr('transform', d => `translate(0, ${groupYPositions[d[0]]})`);
    } else {
        enterSelection.attr('transform', (d, i) => `translate(0, ${(i * ROW_HEIGHT) + HEADER_HEIGHT + 5})`);
    }

    // ** UPDATE + ENTER MERGE **
    const mergeSelection = enterSelection.merge(rowSelection);
    const transitionDelay = title.includes('Grouping') ? 500 : (title.includes('Aggregation') ? 250 : 0);

    mergeSelection.transition().duration(TRANSITION_DURATION).delay(transitionDelay)
        .attr('opacity', 1)
        .attr('transform', (d, i) => {
            let yOffset = 0;
            if (title.includes("Grouping") && groups) {
                const category = d[columns.indexOf('Category')];
                const groupIndex = groups.findIndex(g => g.key === category);
                if(groupIndex !== -1) {
                  yOffset = groupIndex * GROUP_SPACING;
                }
            }
            return `translate(0, ${(i * ROW_HEIGHT) + HEADER_HEIGHT + 5 + yOffset})`;
        });

    // Column highlight animation for grouping
    if (title.includes('Grouping')) {
        const categoryIndex = columns.indexOf('Category');
        if (categoryIndex !== -1) {
            headers.filter((d, i) => i === categoryIndex).select('rect')
                .transition().duration(400).attr('fill', '#0891b2')
                .transition().duration(400).delay(800).attr('fill', '#334155');

            mergeSelection.selectAll('g.cell').filter((d, i) => i === categoryIndex).select('rect')
                .transition().duration(400).attr('fill', '#164e63')
                .transition().duration(400).delay(800).attr('fill', '#1e293b');
        }
    }
    
    // --- Explanation Text ---
    const explanationY = height - PADDING.top - PADDING.bottom - 20;
    const explanationText = gMerge.selectAll("text.explanation").data([step.explanation])
       .join("text")
       .attr("class", "explanation fill-slate-300 text-sm")
       .attr('x', (width - PADDING.left - PADDING.right) / 2)
       .attr('y', explanationY)
       .attr('text-anchor', 'middle')
       .attr("opacity", 0)
       .text(d => d) // Set text immediately to handle wrapping correctly
       
    explanationText
        .transition().duration(500).delay(250)
        .attr("opacity", 1);
        
    // Save current step for next render's transitions
    prevStepRef.current = JSON.parse(JSON.stringify(step));

  }, [step]);

  return <svg ref={svgRef} className="w-full h-full"></svg>;
};

export default ExplanationVisualizer;