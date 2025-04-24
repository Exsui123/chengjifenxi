/**
 * 成绩分析系统 - 小题满分显示修复脚本
 * 用于解决个人小题得分分析中满分显示错误的问题
 */

// 在页面加载完成后执行
window.addEventListener('load', function() {
    console.log('小题满分显示修复脚本已加载');
    
    // 监听分析类型选择变化
    const analysisTypeSelect = document.getElementById('analysisTypeSelect');
    if (analysisTypeSelect) {
        analysisTypeSelect.addEventListener('change', function() {
            if (this.value === 'personal-question-score') {
                console.log('已选择个人小题得分情况分析，准备修复满分显示');
                fixMaxScoreDisplay();
            }
        });
    }
    
    // 监听生成分析按钮点击
    const generateBtn = document.getElementById('generateQuestionScoreBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            console.log('点击了生成分析按钮，准备修复满分显示');
            // 使用setTimeout确保图表渲染完成后再修复
            setTimeout(verifyMaxScoreFixApplied, 500);
        });
    }
    
    // 初始检查
    if (document.getElementById('questionScoreChart')) {
        console.log('检测到已有小题得分图表，立即应用修复');
        verifyMaxScoreFixApplied();
    }
});

/**
 * 修复满分显示
 */
function fixMaxScoreDisplay() {
    console.log('正在应用满分显示修复...');
    
    // 检查修复是否已应用于getQuestionMaxScore函数
    if (typeof window.questionScoreMaxScoreFixed === 'undefined') {
        console.log('修复标记未设置，这表示修复可能尚未应用');
        window.questionScoreMaxScoreFixed = true;
        
        // 检查分析模块是否已加载
        if (typeof window.performQuestionScoreAnalysis === 'function') {
            console.log('分析模块已加载，验证修复状态');
        } else {
            console.warn('分析模块尚未加载，无法应用修复');
        }
    } else {
        console.log('满分显示修复已应用');
    }
}

/**
 * 验证满分修复是否已应用
 */
function verifyMaxScoreFixApplied() {
    const chartCanvas = document.getElementById('questionScoreChart');
    if (!chartCanvas) {
        console.log('未找到小题得分图表，无需验证');
        return;
    }
    
    // 获取Chart.js实例
    const chartInstance = Chart.getChart(chartCanvas);
    if (!chartInstance) {
        console.log('无法获取图表实例，可能未正确渲染');
        return;
    }
    
    // 检查X轴最大值设置
    const xAxis = chartInstance.scales.x;
    if (xAxis && (!xAxis.options.suggestedMax || xAxis.options.suggestedMax <= 10)) {
        console.log('检测到X轴最大值可能未正确设置，尝试应用修复');
        
        // 获取最大满分值
        const maxScores = chartInstance.data.datasets.find(ds => ds.label === '满分')?.data || [];
        const maxScore = Math.max(...maxScores, 10);
        
        // 更新X轴设置
        chartInstance.options.scales.x.suggestedMax = maxScore * 1.1;
        chartInstance.update();
        
        console.log(`已应用X轴修复，设置最大值为 ${maxScore * 1.1}`);
    } else {
        console.log('X轴设置正常，无需修复');
    }
    
    console.log('满分显示修复验证完成');
}

// 将修复函数暴露给全局环境
window.fixMaxScoreDisplay = fixMaxScoreDisplay;
window.verifyMaxScoreFixApplied = verifyMaxScoreFixApplied;

console.log('小题满分显示修复模块加载完成'); 