/**
 * 成绩分析系统 - 跨班级分析增强模块
 * 为跨班级平均分对比分析添加智能总结和优化建议功能
 */

// 在页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 扩展原有的generateCrossAverageComparisonAnalysis函数
    if (typeof window.originalGenerateCrossAverageComparisonAnalysis === 'undefined' && typeof generateCrossAverageComparisonAnalysis === 'function') {
        // 保存原始函数
        window.originalGenerateCrossAverageComparisonAnalysis = generateCrossAverageComparisonAnalysis;
        
        // 重新定义函数，添加智能总结和优化建议功能
        window.generateCrossAverageComparisonAnalysis = function(filesData, selectedSubject, selectedXAxis) {
            // 首先调用原始函数生成图表
            window.originalGenerateCrossAverageComparisonAnalysis(filesData, selectedSubject, selectedXAxis);
            
            // 获取分析结果容器
            setTimeout(function() {
                const container = document.querySelector('.cross-average-comparison-container');
                if (!container) return;
                
                // 计算各班级各科目的平均分
                const averageScores = calculateCrossClassAverages(filesData, selectedSubject);
                
                // 添加智能总结和优化建议
                const summaryContainer = document.createElement('div');
                summaryContainer.className = 'analysis-summary-container';
                
                // 获取智能总结和优化建议内容
                const summaryContent = generateCrossClassAverageAnalysisSummary(averageScores, selectedSubject);
                summaryContainer.appendChild(summaryContent);
                
                // 将总结容器添加到结果区域
                container.appendChild(summaryContainer);
            }, 100); // 短暂延迟确保DOM已更新
        };
        
        console.log('跨班级平均分对比分析增强模块已加载');
    }
}); 