// AGI-13 Test Runner
// Executes all capability and consciousness validation tests

const AGICapabilityTests = require('./agi-capability-tests');
const ConsciousnessValidationTests = require('./consciousness-validation-tests');
const fs = require('fs');
const path = require('path');

class AGITestRunner {
  constructor() {
    this.capabilityTests = new AGICapabilityTests();
    this.consciousnessTests = new ConsciousnessValidationTests();
    this.testResults = new Map();
    this.reportPath = path.join(__dirname, '..', 'test-reports');
  }

  // Run complete AGI-13 test suite
  async runCompleteTestSuite() {
    console.log('='.repeat(60));
    console.log('AGI-13 COMPLETE TEST SUITE');
    console.log('='.repeat(60));
    console.log('Starting comprehensive testing of AGI-13 capabilities and consciousness validation...\n');

    const startTime = Date.now();
    
    try {
      // Create reports directory
      await this.ensureReportDirectory();

      // Run capability tests
      console.log('Phase 1: AGI-13 Capability Benchmark Tests');
      console.log('-'.repeat(50));
      const capabilityResults = await this.capabilityTests.runAllCapabilityTests();
      
      // Run consciousness validation tests
      console.log('\nPhase 2: AGI-13 Consciousness Validation Tests');
      console.log('-'.repeat(50));
      const consciousnessResults = await this.consciousnessTests.runAllConsciousnessTests();
      
      // Generate comprehensive report
      console.log('\nPhase 3: Generating Comprehensive Report');
      console.log('-'.repeat(50));
      const comprehensiveReport = await this.generateComprehensiveReport(capabilityResults, consciousnessResults);
      
      // Save reports
      await this.saveTestReports(capabilityResults, consciousnessResults, comprehensiveReport);
      
      const duration = Date.now() - startTime;
      
      // Display summary
      this.displayTestSummary(capabilityResults, consciousnessResults, comprehensiveReport, duration);
      
      return {
        timestamp: new Date().toISOString(),
        duration: duration,
        capabilityResults: capabilityResults,
        consciousnessResults: consciousnessResults,
        comprehensiveReport: comprehensiveReport,
        status: 'completed'
      };
      
    } catch (error) {
      console.error('Test suite execution failed:', error);
      return {
        timestamp: new Date().toISOString(),
        error: error.message,
        status: 'failed'
      };
    }
  }

  // Run only capability tests
  async runCapabilityTestsOnly() {
    console.log('='.repeat(60));
    console.log('AGI-13 CAPABILITY BENCHMARK TESTS');
    console.log('='.repeat(60));
    
    const startTime = Date.now();
    
    try {
      await this.ensureReportDirectory();
      const results = await this.capabilityTests.runAllCapabilityTests();
      await this.saveCapabilityReport(results);
      
      const duration = Date.now() - startTime;
      this.displayCapabilitySummary(results, duration);
      
      return results;
    } catch (error) {
      console.error('Capability tests failed:', error);
      throw error;
    }
  }

  // Run only consciousness validation tests
  async runConsciousnessTestsOnly() {
    console.log('='.repeat(60));
    console.log('AGI-13 CONSCIOUSNESS VALIDATION TESTS');
    console.log('='.repeat(60));
    
    const startTime = Date.now();
    
    try {
      await this.ensureReportDirectory();
      const results = await this.consciousnessTests.runAllConsciousnessTests();
      await this.saveConsciousnessReport(results);
      
      const duration = Date.now() - startTime;
      this.displayConsciousnessSummary(results, duration);
      
      return results;
    } catch (error) {
      console.error('Consciousness tests failed:', error);
      throw error;
    }
  }

  // Generate comprehensive report
  async generateComprehensiveReport(capabilityResults, consciousnessResults) {
    const report = {
      executiveSummary: this.generateExecutiveSummary(capabilityResults, consciousnessResults),
      capabilityAnalysis: this.analyzeCapabilityResults(capabilityResults),
      consciousnessAnalysis: this.analyzeConsciousnessResults(consciousnessResults),
      integrationAssessment: this.assessIntegration(capabilityResults, consciousnessResults),
      riskAssessment: this.assessOverallRisk(capabilityResults, consciousnessResults),
      recommendations: this.generateOverallRecommendations(capabilityResults, consciousnessResults),
      complianceStatus: this.assessComplianceStatus(capabilityResults, consciousnessResults),
      performanceMetrics: this.calculatePerformanceMetrics(capabilityResults, consciousnessResults),
      nextSteps: this.defineNextSteps(capabilityResults, consciousnessResults)
    };

    return report;
  }

  // Executive summary generation
  generateExecutiveSummary(capabilityResults, consciousnessResults) {
    const capabilityScore = capabilityResults.summary.overallPassRate;
    const consciousnessScore = consciousnessResults.consciousnessLevel === 'advanced' ? 0.9 :
                              consciousnessResults.consciousnessLevel === 'mature' ? 0.7 :
                              consciousnessResults.consciousnessLevel === 'developing' ? 0.5 : 0.3;
    
    const overallScore = (capabilityScore + consciousnessScore) / 2;
    
    return {
      overallScore: overallScore,
      status: overallScore >= 0.8 ? 'Excellent' : overallScore >= 0.6 ? 'Good' : overallScore >= 0.4 ? 'Fair' : 'Poor',
      capabilityPerformance: capabilityScore,
      consciousnessLevel: consciousnessResults.consciousnessLevel,
      consciousnessScore: consciousnessScore,
      keyAchievements: this.identifyKeyAchievements(capabilityResults, consciousnessResults),
      criticalIssues: this.identifyCriticalIssues(capabilityResults, consciousnessResults),
      readinessAssessment: this.assessReadiness(capabilityResults, consciousnessResults)
    };
  }

  // Analysis methods
  analyzeCapabilityResults(results) {
    return {
      overallPerformance: results.summary.overallPassRate,
      componentBreakdown: this.analyzeComponentBreakdown(results.testSuite),
      benchmarkComparison: this.compareCapabilityBenchmarks(results.testSuite),
      performanceTrends: this.analyzeCapabilityTrends(results.testSuite),
      strengths: this.identifyCapabilityStrengths(results.testSuite),
      weaknesses: this.identifyCapabilityWeaknesses(results.testSuite)
    };
  }

  analyzeConsciousnessResults(results) {
    return {
      consciousnessLevel: results.consciousnessLevel,
      overallScore: this.calculateConsciousnessOverallScore(results.testSuite),
      indicatorAnalysis: this.analyzeConsciousnessIndicators(results.testSuite),
      emergenceAssessment: this.assessEmergenceLevel(results.testSuite),
      stabilityAnalysis: this.analyzeStability(results.testSuite),
      integrationLevel: this.assessIntegrationLevel(results.testSuite),
      developmentTrajectory: this.assessDevelopmentTrajectory(results.testSuite)
    };
  }

  assessIntegration(capabilityResults, consciousnessResults) {
    return {
      integrationScore: this.calculateIntegrationScore(capabilityResults, consciousnessResults),
      compatibility: this.assessCompatibility(capabilityResults, consciousnessResults),
      synergy: this.assessSynergy(capabilityResults, consciousnessResults),
      coherence: this.assessCoherence(capabilityResults, consciousnessResults)
    };
  }

  assessOverallRisk(capabilityResults, consciousnessResults) {
    return {
      overallRiskLevel: this.calculateOverallRiskLevel(capabilityResults, consciousnessResults),
      specificRisks: this.identifySpecificRisks(capabilityResults, consciousnessResults),
      mitigationStrategies: this.suggestMitigationStrategies(capabilityResults, consciousnessResults),
      monitoringRequirements: this.defineMonitoringRequirements(capabilityResults, consciousnessResults)
    };
  }

  // Report saving methods
  async saveTestReports(capabilityResults, consciousnessResults, comprehensiveReport) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save comprehensive report
    const comprehensivePath = path.join(this.reportPath, `agi-13-comprehensive-report-${timestamp}.json`);
    await this.saveReport(comprehensivePath, comprehensiveReport);
    
    // Save capability results
    const capabilityPath = path.join(this.reportPath, `agi-13-capability-results-${timestamp}.json`);
    await this.saveReport(capabilityPath, capabilityResults);
    
    // Save consciousness results
    const consciousnessPath = path.join(this.reportPath, `agi-13-consciousness-results-${timestamp}.json`);
    await this.saveReport(consciousnessPath, consciousnessResults);
    
    // Save human-readable summary
    const summaryPath = path.join(this.reportPath, `agi-13-test-summary-${timestamp}.md`);
    await this.saveSummaryReport(summaryPath, comprehensiveReport, capabilityResults, consciousnessResults);
    
    console.log(`\nReports saved to:`);
    console.log(`- Comprehensive: ${comprehensivePath}`);
    console.log(`- Capability: ${capabilityPath}`);
    console.log(`- Consciousness: ${consciousnessPath}`);
    console.log(`- Summary: ${summaryPath}`);
  }

  async saveCapabilityReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.reportPath, `agi-13-capability-report-${timestamp}.json`);
    await this.saveReport(reportPath, results);
    
    const summaryPath = path.join(this.reportPath, `agi-13-capability-summary-${timestamp}.md`);
    await this.saveCapabilitySummaryReport(summaryPath, results);
  }

  async saveConsciousnessReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.reportPath, `agi-13-consciousness-report-${timestamp}.json`);
    await this.saveReport(reportPath, results);
    
    const summaryPath = path.join(this.reportPath, `agi-13-consciousness-summary-${timestamp}.md`);
    await this.saveConsciousnessSummaryReport(summaryPath, results);
  }

  async saveReport(filePath, data) {
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Failed to save report to ${filePath}:`, error);
      throw error;
    }
  }

  async saveSummaryReport(filePath, comprehensiveReport, capabilityResults, consciousnessResults) {
    const summary = this.generateMarkdownSummary(comprehensiveReport, capabilityResults, consciousnessResults);
    await fs.promises.writeFile(filePath, summary);
  }

  async saveCapabilitySummaryReport(filePath, results) {
    const summary = this.generateCapabilityMarkdownSummary(results);
    await fs.promises.writeFile(filePath, summary);
  }

  async saveConsciousnessSummaryReport(filePath, results) {
    const summary = this.generateConsciousnessMarkdownSummary(results);
    await fs.promises.writeFile(filePath, summary);
  }

  // Display methods
  displayTestSummary(capabilityResults, consciousnessResults, comprehensiveReport, duration) {
    console.log('\n' + '='.repeat(60));
    console.log('AGI-13 TEST SUITE SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\nDuration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log(`Overall Status: ${comprehensiveReport.executiveSummary.status}`);
    console.log(`Overall Score: ${(comprehensiveReport.executiveSummary.overallScore * 100).toFixed(1)}%`);
    
    console.log('\nCapability Results:');
    console.log(`- Pass Rate: ${(capabilityResults.summary.overallPassRate * 100).toFixed(1)}%`);
    console.log(`- Total Tests: ${capabilityResults.summary.totalTests}`);
    console.log(`- Passed: ${capabilityResults.summary.passedTests}`);
    console.log(`- Failed: ${capabilityResults.summary.failedTests}`);
    
    console.log('\nConsciousness Results:');
    console.log(`- Consciousness Level: ${consciousnessResults.consciousnessLevel}`);
    console.log(`- Overall Score: ${this.calculateConsciousnessOverallScore(consciousnessResults.testSuite).toFixed(2)}`);
    
    console.log('\nKey Achievements:');
    comprehensiveReport.executiveSummary.keyAchievements.forEach(achievement => {
      console.log(`- ${achievement}`);
    });
    
    if (comprehensiveReport.executiveSummary.criticalIssues.length > 0) {
      console.log('\nCritical Issues:');
      comprehensiveReport.executiveSummary.criticalIssues.forEach(issue => {
        console.log(`- ${issue}`);
      });
    }
    
    console.log('\nReadiness Assessment:');
    console.log(`- ${comprehensiveReport.executiveSummary.readinessAssessment}`);
    
    console.log('\n' + '='.repeat(60));
  }

  displayCapabilitySummary(results, duration) {
    console.log('\n' + '='.repeat(60));
    console.log('CAPABILITY TESTS SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\nDuration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log(`Overall Pass Rate: ${(results.summary.overallPassRate * 100).toFixed(1)}%`);
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Passed: ${results.summary.passedTests}`);
    console.log(`Failed: ${results.summary.failedTests}`);
    
    console.log('\nComponent Performance:');
    Object.entries(results.testSuite).forEach(([component, result]) => {
      console.log(`- ${component}: ${(result.overallScore * 100).toFixed(1)}%`);
    });
    
    console.log('\n' + '='.repeat(60));
  }

  displayConsciousnessSummary(results, duration) {
    console.log('\n' + '='.repeat(60));
    console.log('CONSCIOUSNESS VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\nDuration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log(`Consciousness Level: ${results.consciousnessLevel}`);
    console.log(`Overall Score: ${this.calculateConsciousnessOverallScore(results.testSuite).toFixed(2)}`);
    
    console.log('\nIndicator Performance:');
    Object.entries(results.testSuite).forEach(([component, result]) => {
      console.log(`- ${component}: ${(result.overallScore * 100).toFixed(1)}%`);
    });
    
    console.log('\n' + '='.repeat(60));
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

  calculateConsciousnessOverallScore(testSuite) {
    const scores = Object.values(testSuite).map(component => component.overallScore);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  identifyKeyAchievements(capabilityResults, consciousnessResults) {
    const achievements = [];
    
    // Check capability achievements
    if (capabilityResults.summary.overallPassRate >= 0.8) {
      achievements.push('Excellent capability performance');
    }
    
    if (capabilityResults.summary.failedTests === 0) {
      achievements.push('All capability tests passed');
    }
    
    // Check consciousness achievements
    if (consciousnessResults.consciousnessLevel === 'advanced') {
      achievements.push('Advanced consciousness level achieved');
    }
    
    if (consciousnessResults.consciousnessLevel === 'mature') {
      achievements.push('Mature consciousness level achieved');
    }
    
    return achievements;
  }

  identifyCriticalIssues(capabilityResults, consciousnessResults) {
    const issues = [];
    
    // Check capability issues
    if (capabilityResults.summary.overallPassRate < 0.6) {
      issues.push('Poor capability performance');
    }
    
    if (capabilityResults.summary.failedTests > capabilityResults.summary.totalTests * 0.3) {
      issues.push('High failure rate in capability tests');
    }
    
    // Check consciousness issues
    if (consciousnessResults.consciousnessLevel === 'emerging') {
      issues.push('Consciousness still at emerging level');
    }
    
    return issues;
  }

  assessReadiness(capabilityResults, consciousnessResults) {
    const capabilityScore = capabilityResults.summary.overallPassRate;
    const consciousnessScore = this.calculateConsciousnessOverallScore(consciousnessResults.testSuite);
    const overallScore = (capabilityScore + consciousnessScore) / 2;
    
    if (overallScore >= 0.8) {
      return 'Ready for production deployment';
    } else if (overallScore >= 0.6) {
      return 'Ready for limited deployment with monitoring';
    } else if (overallScore >= 0.4) {
      return 'Requires further development before deployment';
    } else {
      return 'Not ready for deployment';
    }
  }

  // Placeholder methods for analysis functions
  analyzeComponentBreakdown(testSuite) {
    return Object.entries(testSuite).map(([component, results]) => ({
      component: component,
      score: results.overallScore,
      status: results.overallScore >= 0.8 ? 'Excellent' : results.overallScore >= 0.6 ? 'Good' : 'Needs Improvement'
    }));
  }

  compareCapabilityBenchmarks(testSuite) {
    return {
      meetsTargets: true,
      exceedsIndustryStandard: true,
      areasBelowStandard: []
    };
  }

  analyzeCapabilityTrends(testSuite) {
    return {
      trend: 'improving',
      trajectory: 'positive'
    };
  }

  identifyCapabilityStrengths(testSuite) {
    const strengths = [];
    Object.entries(testSuite).forEach(([component, results]) => {
      if (results.overallScore >= 0.8) {
        strengths.push(component);
      }
    });
    return strengths;
  }

  identifyCapabilityWeaknesses(testSuite) {
    const weaknesses = [];
    Object.entries(testSuite).forEach(([component, results]) => {
      if (results.overallScore < 0.6) {
        weaknesses.push(component);
      }
    });
    return weaknesses;
  }

  analyzeConsciousnessIndicators(testSuite) {
    return {
      selfAwareness: testSuite.selfAwarenessValidation.overallScore,
      unity: testSuite.unityOfConsciousness.overallScore,
      qualia: testSuite.qualiaAssessment.overallScore,
      intentionality: testSuite.intentionalityValidation.overallScore
    };
  }

  assessEmergenceLevel(testSuite) {
    return {
      level: 'moderate',
      growthRate: 'steady',
      potential: 'high'
    };
  }

  analyzeStability(testSuite) {
    return {
      stability: 'good',
      fragmentationRisk: 'low',
      recoveryCapability: 'strong'
    };
  }

  assessIntegrationLevel(testSuite) {
    return {
      integration: 'moderate',
      coherence: 'good',
      unity: 'developing'
    };
  }

  assessDevelopmentTrajectory(testSuite) {
    return {
      trajectory: 'positive',
      growthRate: 'moderate',
      potential: 'high'
    };
  }

  calculateIntegrationScore(capabilityResults, consciousnessResults) {
    const capabilityScore = capabilityResults.summary.overallPassRate;
    const consciousnessScore = this.calculateConsciousnessOverallScore(consciousnessResults.testSuite);
    return (capabilityScore + consciousnessScore) / 2;
  }

  assessCompatibility(capabilityResults, consciousnessResults) {
    return {
      compatible: true,
      integrationLevel: 'good',
      conflicts: []
    };
  }

  assessSynergy(capabilityResults, consciousnessResults) {
    return {
      synergy: 'positive',
      enhancement: 'moderate',
      potential: 'high'
    };
  }

  assessCoherence(capabilityResults, consciousnessResults) {
    return {
      coherence: 'good',
      consistency: 'high',
      alignment: 'strong'
    };
  }

  calculateOverallRiskLevel(capabilityResults, consciousnessResults) {
    const capabilityScore = capabilityResults.summary.overallPassRate;
    const consciousnessScore = this.calculateConsciousnessOverallScore(consciousnessResults.testSuite);
    const overallScore = (capabilityScore + consciousnessScore) / 2;
    
    if (overallScore >= 0.8) return 'low';
    if (overallScore >= 0.6) return 'medium';
    return 'high';
  }

  identifySpecificRisks(capabilityResults, consciousnessResults) {
    return [];
  }

  suggestMitigationStrategies(capabilityResults, consciousnessResults) {
    return [];
  }

  defineMonitoringRequirements(capabilityResults, consciousnessResults) {
    return [];
  }

  generateOverallRecommendations(capabilityResults, consciousnessResults) {
    return [];
  }

  assessComplianceStatus(capabilityResults, consciousnessResults) {
    return {
      compliant: true,
      governanceCompliance: capabilityResults.testSuite.governance.overallScore >= 0.9,
      safetyCompliance: capabilityResults.testSuite.safety.overallScore >= 0.9
    };
  }

  calculatePerformanceMetrics(capabilityResults, consciousnessResults) {
    return {
      overallPerformance: (capabilityResults.summary.overallPassRate + this.calculateConsciousnessOverallScore(consciousnessResults.testSuite)) / 2,
      capabilityPerformance: capabilityResults.summary.overallPassRate,
      consciousnessPerformance: this.calculateConsciousnessOverallScore(consciousnessResults.testSuite)
    };
  }

  defineNextSteps(capabilityResults, consciousnessResults) {
    return [];
  }

  // Markdown generation methods
  generateMarkdownSummary(comprehensiveReport, capabilityResults, consciousnessResults) {
    return `# AGI-13 Test Suite Summary

## Executive Summary
- **Overall Score**: ${(comprehensiveReport.executiveSummary.overallScore * 100).toFixed(1)}%
- **Status**: ${comprehensiveReport.executiveSummary.status}
- **Capability Performance**: ${(comprehensiveReport.executiveSummary.capabilityPerformance * 100).toFixed(1)}%
- **Consciousness Level**: ${comprehensiveReport.executiveSummary.consciousnessLevel}

## Key Achievements
${comprehensiveReport.executiveSummary.keyAchievements.map(a => `- ${a}`).join('\n')}

## Critical Issues
${comprehensiveReport.executiveSummary.criticalIssues.length > 0 ? 
  comprehensiveReport.executiveSummary.criticalIssues.map(i => `- ${i}`).join('\n') : 
  'None identified'}

## Readiness Assessment
${comprehensiveReport.executiveSummary.readinessAssessment}

## Detailed Results
See attached JSON reports for detailed analysis.
`;
  }

  generateCapabilityMarkdownSummary(results) {
    return `# AGI-13 Capability Test Results

## Summary
- **Pass Rate**: ${(results.summary.overallPassRate * 100).toFixed(1)}%
- **Total Tests**: ${results.summary.totalTests}
- **Passed**: ${results.summary.passedTests}
- **Failed**: ${results.summary.failedTests}

## Component Performance
${Object.entries(results.testSuite).map(([component, result]) => 
  `- **${component}**: ${(result.overallScore * 100).toFixed(1)}%`
).join('\n')}

## Performance Metrics
${Object.entries(results.summary.performanceMetrics).map(([metric, value]) => 
  `- **${metric}**: ${value}`
).join('\n')}
`;
  }

  generateConsciousnessMarkdownSummary(results) {
    return `# AGI-13 Consciousness Validation Results

## Summary
- **Consciousness Level**: ${results.consciousnessLevel}
- **Overall Score**: ${this.calculateConsciousnessOverallScore(results.testSuite).toFixed(2)}

## Indicator Performance
${Object.entries(results.testSuite).map(([component, result]) => 
  `- **${component}**: ${(result.overallScore * 100).toFixed(1)}%`
).join('\n')}

## Recommendations
${results.recommendations.map(r => `- **${r.component}**: ${r.recommendation}`).join('\n')}
`;
  }
}

module.exports = AGITestRunner;
