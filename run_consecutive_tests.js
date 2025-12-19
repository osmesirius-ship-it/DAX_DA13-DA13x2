// Run AGI-13 Capability Tests 13 Consecutive Times
// Analyzes consistency and performance patterns

const AGITestRunner = require('./tests/test-runner');
const fs = require('fs');
const path = require('path');

class ConsecutiveTestRunner {
  constructor() {
    this.testRunner = new AGITestRunner();
    this.results = [];
    this.reportPath = path.join(__dirname, 'test-reports');
  }

  // Run capability tests 13 consecutive times
  async runConsecutiveTests() {
    console.log('='.repeat(80));
    console.log('AGI-13 CAPABILITY TESTS - 13 CONSECUTIVE RUNS');
    console.log('='.repeat(80));
    console.log('Running capability tests 13 times to analyze consistency...\n');

    const startTime = Date.now();
    
    try {
      // Ensure report directory exists
      await this.ensureReportDirectory();

      // Run tests 13 times
      for (let i = 1; i <= 13; i++) {
        console.log(`\nRun ${i}/13 - ${new Date().toLocaleTimeString()}`);
        console.log('-'.repeat(50));
        
        const runStartTime = Date.now();
        const result = await this.testRunner.runCapabilityTestsOnly();
        const runDuration = Date.now() - runStartTime;
        
        // Store result with metadata
        this.results.push({
          run: i,
          timestamp: new Date().toISOString(),
          duration: runDuration,
          results: result,
          crossDomainTransferScore: result.testSuite.cognitiveFlexibility.tests.crossDomainTransfer.score,
          overallScore: result.summary.overallPassRate
        });
        
        console.log(`Run ${i} completed in ${(runDuration / 1000).toFixed(2)}s`);
        console.log(`Cross-Domain Transfer Score: ${result.testSuite.cognitiveFlexibility.tests.crossDomainTransfer.score}`);
        console.log(`Overall Pass Rate: ${(result.summary.overallPassRate * 100).toFixed(1)}%`);
        
        // Brief pause between runs
        if (i < 13) {
          await this.pause(1000);
        }
      }

      const totalDuration = Date.now() - startTime;
      
      // Generate analysis
      console.log('\n' + '='.repeat(80));
      console.log('GENERATING CONSECUTIVE RUN ANALYSIS');
      console.log('='.repeat(80));
      
      const analysis = await this.generateConsecutiveAnalysis();
      await this.saveConsecutiveResults(analysis);
      
      // Display summary
      this.displayConsecutiveSummary(analysis, totalDuration);
      
      return analysis;
      
    } catch (error) {
      console.error('Consecutive test execution failed:', error);
      throw error;
    }
  }

  // Generate analysis of consecutive runs
  async generateConsecutiveAnalysis() {
    const crossDomainScores = this.results.map(r => r.crossDomainTransferScore);
    const overallScores = this.results.map(r => r.overallScore);
    const durations = this.results.map(r => r.duration);

    const analysis = {
      totalRuns: this.results.length,
      timestamp: new Date().toISOString(),
      crossDomainTransfer: {
        scores: crossDomainScores,
        mean: this.calculateMean(crossDomainScores),
        median: this.calculateMedian(crossDomainScores),
        stdDev: this.calculateStdDev(crossDomainScores),
        min: Math.min(...crossDomainScores),
        max: Math.max(...crossDomainScores),
        range: Math.max(...crossDomainScores) - Math.min(...crossDomainScores),
        consistency: this.assessConsistency(crossDomainScores),
        trend: this.calculateTrend(crossDomainScores)
      },
      overallPerformance: {
        scores: overallScores,
        mean: this.calculateMean(overallScores),
        median: this.calculateMedian(overallScores),
        stdDev: this.calculateStdDev(overallScores),
        min: Math.min(...overallScores),
        max: Math.max(...overallScores),
        consistency: this.assessConsistency(overallScores)
      },
      performanceMetrics: {
        durations: durations,
        meanDuration: this.calculateMean(durations),
        totalDuration: durations.reduce((sum, d) => sum + d, 0),
        performanceStability: this.assessPerformanceStability(durations)
      },
      detailedRuns: this.results,
      recommendations: this.generateRecommendations(crossDomainScores, overallScores)
    };

    return analysis;
  }

  // Statistical calculations
  calculateMean(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculateStdDev(values) {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  assessConsistency(scores) {
    const stdDev = this.calculateStdDev(scores);
    const mean = this.calculateMean(scores);
    const coefficientOfVariation = stdDev / mean;
    
    if (coefficientOfVariation < 0.05) return 'excellent';
    if (coefficientOfVariation < 0.1) return 'good';
    if (coefficientOfVariation < 0.2) return 'moderate';
    return 'poor';
  }

  calculateTrend(scores) {
    const n = scores.length;
    const xSum = (n * (n - 1)) / 2;
    const ySum = scores.reduce((sum, val) => sum + val, 0);
    const xySum = scores.reduce((sum, val, i) => sum + (i * val), 0);
    const x2Sum = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    
    if (slope > 0.01) return 'improving';
    if (slope < -0.01) return 'declining';
    return 'stable';
  }

  assessPerformanceStability(durations) {
    const stdDev = this.calculateStdDev(durations);
    const mean = this.calculateMean(durations);
    const variation = stdDev / mean;
    
    if (variation < 0.1) return 'stable';
    if (variation < 0.2) return 'moderate';
    return 'unstable';
  }

  generateRecommendations(crossDomainScores, overallScores) {
    const recommendations = [];
    
    // Cross-domain transfer recommendations
    const crossDomainMean = this.calculateMean(crossDomainScores);
    if (crossDomainMean < 0.85) {
      recommendations.push({
        area: 'Cross-Domain Transfer',
        priority: 'high',
        issue: `Average score ${crossDomainMean.toFixed(2)} below target 0.9`,
        action: 'Implement semantic similarity analysis and dynamic adaptation confidence'
      });
    }
    
    if (this.assessConsistency(crossDomainScores) !== 'excellent') {
      recommendations.push({
        area: 'Cross-Domain Transfer Consistency',
        priority: 'medium',
        issue: 'Inconsistent performance across runs',
        action: 'Replace random confidence generation with deterministic algorithms'
      });
    }
    
    // Overall performance recommendations
    if (this.assessConsistency(overallScores) !== 'good') {
      recommendations.push({
        area: 'Overall Performance',
        priority: 'medium',
        issue: 'Performance variability detected',
        action: 'Implement caching and optimization for consistent results'
      });
    }
    
    return recommendations;
  }

  // Save consecutive test results
  async saveConsecutiveResults(analysis) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.reportPath, `agi-13-consecutive-analysis-${timestamp}.json`);
    
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(analysis, null, 2));
      console.log(`\nConsecutive test analysis saved to: ${filePath}`);
    } catch (error) {
      console.error(`Failed to save consecutive analysis:`, error);
    }
  }

  // Display summary of consecutive runs
  displayConsecutiveSummary(analysis, totalDuration) {
    console.log('\n' + '='.repeat(80));
    console.log('CONSECUTIVE RUNS SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\nTotal Duration: ${(totalDuration / 1000).toFixed(2)} seconds`);
    console.log(`Total Runs: ${analysis.totalRuns}`);
    
    console.log('\nCross-Domain Transfer Performance:');
    console.log(`- Mean Score: ${analysis.crossDomainTransfer.mean.toFixed(3)}`);
    console.log(`- Median Score: ${analysis.crossDomainTransfer.median.toFixed(3)}`);
    console.log(`- Standard Deviation: ${analysis.crossDomainTransfer.stdDev.toFixed(3)}`);
    console.log(`- Range: ${analysis.crossDomainTransfer.min.toFixed(3)} - ${analysis.crossDomainTransfer.max.toFixed(3)}`);
    console.log(`- Consistency: ${analysis.crossDomainTransfer.consistency}`);
    console.log(`- Trend: ${analysis.crossDomainTransfer.trend}`);
    
    console.log('\nOverall Performance:');
    console.log(`- Mean Pass Rate: ${(analysis.overallPerformance.mean * 100).toFixed(1)}%`);
    console.log(`- Median Pass Rate: ${(analysis.overallPerformance.median * 100).toFixed(1)}%`);
    console.log(`- Standard Deviation: ${(analysis.overallPerformance.stdDev * 100).toFixed(1)}%`);
    console.log(`- Consistency: ${analysis.overallPerformance.consistency}`);
    
    console.log('\nPerformance Metrics:');
    console.log(`- Mean Duration: ${(analysis.performanceMetrics.meanDuration / 1000).toFixed(2)}s`);
    console.log(`- Performance Stability: ${analysis.performanceMetrics.performanceStability}`);
    
    if (analysis.recommendations.length > 0) {
      console.log('\nRecommendations:');
      analysis.recommendations.forEach(rec => {
        console.log(`- [${rec.priority.toUpperCase()}] ${rec.area}: ${rec.action}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }

  // Helper methods
  async ensureReportDirectory() {
    try {
      await fs.promises.mkdir(this.reportPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new ConsecutiveTestRunner();
  runner.runConsecutiveTests()
    .then(() => {
      console.log('\nConsecutive test execution completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Consecutive test execution failed:', error);
      process.exit(1);
    });
}

module.exports = ConsecutiveTestRunner;
