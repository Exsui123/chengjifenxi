/**
 * 成绩分析系统 - 图表增强模块
 * 用于优化饼图统计信息的显示效果
 */

// 在页面加载完成后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化图表增强功能
    initChartEnhancer();
});

/**
 * 初始化图表增强功能
 */
function initChartEnhancer() {
    console.log('图表增强模块已加载');
    
    // 创建DOM变化观察器
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                // 检查是否添加了统计信息元素
                enhanceLevelProportionStats();
            }
        });
    });
    
    // 选择要观察的目标节点
    const analysisResult = document.getElementById('analysisResult');
    if (analysisResult) {
        // 开始观察DOM变化
        observer.observe(analysisResult, { childList: true, subtree: true });
        console.log('开始监听分析结果区域的变化');
    } else {
        console.log('未找到分析结果区域，将延迟初始化');
        // 如果分析结果区域尚未加载，则延迟执行
        setTimeout(initChartEnhancer, 1000);
    }
    
    // 立即执行一次检查，以防元素已经存在
    enhanceLevelProportionStats();
}

/**
 * 优化饼图统计信息的显示效果
 */
function enhanceLevelProportionStats() {
    // 查找统计信息元素
    const statsElements = document.querySelectorAll('.level-proportion-stats');
    if (statsElements.length === 0) return;
    
    console.log('找到饼图统计元素，开始优化显示');
    
    // 遍历统计信息元素
    statsElements.forEach(function(statsElement) {
        // 如果已经优化过，则跳过
        if (statsElement.classList.contains('chart-stats-container')) return;
        
        // 更改样式类
        statsElement.classList.remove('level-proportion-stats');
        statsElement.classList.add('chart-stats-container');
        
        // 获取各等级人数和百分比信息
        const excellentItem = statsElement.querySelector('.stats-item.excellent');
        const goodItem = statsElement.querySelector('.stats-item.good');
        const passItem = statsElement.querySelector('.stats-item.pass');
        const failItem = statsElement.querySelector('.stats-item.fail');
        const statsRow = statsElement.querySelector('.stats-row');
        const statsSummary = statsElement.querySelector('.stats-summary');
        
        if (!excellentItem || !goodItem || !passItem || !failItem || !statsRow || !statsSummary) {
            console.log('统计元素结构不完整，无法优化', statsElement);
            return;
        }
        
        // 提取数据
        function extractData(element) {
            const labelElement = element.querySelector('.stats-label');
            const valueElement = element.querySelector('.stats-value');
            const percentElement = element.querySelector('.stats-percent');
            
            return {
                label: labelElement ? labelElement.textContent.trim() : '',
                count: valueElement ? valueElement.textContent.trim() : '0人',
                percent: percentElement ? percentElement.textContent.trim() : '0.0%'
            };
        }
        
        const excellent = extractData(excellentItem);
        const good = extractData(goodItem);
        const pass = extractData(passItem);
        const fail = extractData(failItem);
        
        // 提取汇总信息
        const summaryText = statsSummary.textContent.trim();
        const totalMatch = summaryText.match(/有效数据: (\d+)人/);
        const invalidMatch = summaryText.match(/无效数据: (\d+)人/);
        const thresholdMatch = summaryText.match(/分数线: 优秀≥(\d+)分, 良好≥(\d+)分, 及格≥(\d+)分/);
        
        // 总人数
        const totalCount = totalMatch ? totalMatch[1] : '0';
        const invalidCount = invalidMatch ? invalidMatch[1] : '0';
        
        // 分数线
        const excellentScore = thresholdMatch ? thresholdMatch[1] : '90';
        const goodScore = thresholdMatch ? thresholdMatch[2] : '75';
        const passScore = thresholdMatch ? thresholdMatch[3] : '60';
        
        // 创建新的HTML结构
        statsElement.innerHTML = `
            <div class="chart-stats-content">
                <div class="chart-stats-row">
                    <div class="stats-item excellent">
                        <div class="stats-label">优秀</div>
                        <div class="stats-value">${excellent.count}<span class="stats-percentage">${excellent.percent}</span></div>
                    </div>
                    <div class="stats-item good">
                        <div class="stats-label">良好</div>
                        <div class="stats-value">${good.count}<span class="stats-percentage">${good.percent}</span></div>
                    </div>
                </div>
                <div class="chart-stats-row">
                    <div class="stats-item pass">
                        <div class="stats-label">及格</div>
                        <div class="stats-value">${pass.count}<span class="stats-percentage">${pass.percent}</span></div>
                    </div>
                    <div class="stats-item fail">
                        <div class="stats-label">不及格</div>
                        <div class="stats-value">${fail.count}<span class="stats-percentage">${fail.percent}</span></div>
                    </div>
                </div>
            </div>
            <div class="score-threshold-info">
                <div class="stats-item total">
                    <div class="stats-label">总计</div>
                    <div class="stats-value">${totalCount}人 ${invalidMatch ? `<span class="stats-percentage">(无效数据: ${invalidCount}人)</span>` : ''}</div>
                </div>
                <div style="margin-top: 10px;">分数线设置: 优秀≥${excellentScore}分, 良好≥${goodScore}分, 及格≥${passScore}分</div>
            </div>
        `;
        
        console.log('饼图统计信息优化完成');
    });
} 