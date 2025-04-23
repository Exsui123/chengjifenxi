/**
 * 成绩分析系统 - 跨班级分数等级占比分析增强模块
 * 为跨班级分数等级占比分析添加智能总结和优化建议功能
 */

// 在页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 扩展原有的generateCrossScoreLevelProportionAnalysis函数
    if (typeof window.originalGenerateCrossScoreLevelProportionAnalysis === 'undefined' && typeof generateCrossScoreLevelProportionAnalysis === 'function') {
        // 保存原始函数
        window.originalGenerateCrossScoreLevelProportionAnalysis = generateCrossScoreLevelProportionAnalysis;
        
        // 重新定义函数，添加智能总结和优化建议功能
        window.generateCrossScoreLevelProportionAnalysis = function(filesData, selectedSubject, thresholds) {
            // 首先调用原始函数生成图表
            window.originalGenerateCrossScoreLevelProportionAnalysis(filesData, selectedSubject, thresholds);
            
            // 获取分析结果容器
            setTimeout(function() {
                const resultDiv = document.getElementById('analysisResult');
                if (!resultDiv) return;
                
                // 计算各班级分数等级占比
                const levelProportions = calculateClassLevelProportions(filesData, selectedSubject, thresholds);
                
                // 添加智能总结和优化建议
                const summaryContainer = document.createElement('div');
                summaryContainer.className = 'score-level-analysis-summary-container';
                
                const heading = document.createElement('h3');
                heading.className = 'summary-heading';
                heading.textContent = '智能总结和优化建议';
                summaryContainer.appendChild(heading);
                
                // 获取智能总结和优化建议内容
                const summaryContent = generateCrossClassScoreLevelAnalysisSummary(levelProportions, selectedSubject, thresholds);
                summaryContainer.appendChild(summaryContent);
                
                // 将总结容器添加到结果区域
                resultDiv.appendChild(summaryContainer);
            }, 100); // 短暂延迟确保DOM已更新
        };
        
        console.log('跨班级分数等级占比分析增强模块已加载');
    }
});

/**
 * 生成跨班级分数等级占比分析智能总结和优化建议
 * @param {Object} levelProportions - 各班级分数等级占比数据
 * @param {string} selectedSubject - 选中的科目
 * @param {Object} thresholds - 分数线设置
 * @returns {HTMLElement} - 总结和建议内容的DOM元素
 */
function generateCrossClassScoreLevelAnalysisSummary(levelProportions, selectedSubject, thresholds) {
    const container = document.createElement('div');
    container.className = 'summary-content';
    
    // 准备数据分析
    const classNames = levelProportions.classNames;
    const classCount = classNames.length;
    
    if (classCount < 2) {
        const noDataMessage = document.createElement('p');
        noDataMessage.className = 'summary-message';
        noDataMessage.textContent = '需要至少两个班级的数据才能生成有效的跨班级对比分析。';
        container.appendChild(noDataMessage);
        return container;
    }
    
    // 1. 创建整体分析部分
    const overallSection = document.createElement('div');
    overallSection.className = 'summary-section';
    
    const overallHeading = document.createElement('h4');
    overallHeading.className = 'section-heading';
    overallHeading.textContent = '整体情况分析';
    overallSection.appendChild(overallHeading);
    
    // 计算各班级优秀率平均值和最大最小值
    const excellentAvg = levelProportions.excellent.reduce((a, b) => a + b, 0) / classCount;
    const excellentMax = Math.max(...levelProportions.excellent);
    const excellentMin = Math.min(...levelProportions.excellent);
    const excellentMaxClass = classNames[levelProportions.excellent.indexOf(excellentMax)];
    const excellentMinClass = classNames[levelProportions.excellent.indexOf(excellentMin)];
    
    // 计算各班级不及格率平均值和最大最小值
    const failAvg = levelProportions.fail.reduce((a, b) => a + b, 0) / classCount;
    const failMax = Math.max(...levelProportions.fail);
    const failMin = Math.min(...levelProportions.fail);
    const failMaxClass = classNames[levelProportions.fail.indexOf(failMax)];
    const failMinClass = classNames[levelProportions.fail.indexOf(failMin)];
    
    // 优秀率差距
    const excellentGap = excellentMax - excellentMin;
    
    // 添加整体分析内容
    const overallAnalysis = document.createElement('p');
    overallAnalysis.innerHTML = `
        <span class="highlight">📊 整体分析：</span>在${selectedSubject}科目中，${classCount}个班级的平均优秀率为<span class="emphasis">${excellentAvg.toFixed(2)}%</span>，
        平均不及格率为<span class="emphasis">${failAvg.toFixed(2)}%</span>。班级间优秀率最大差距为<span class="emphasis">${excellentGap.toFixed(2)}%</span>，
        表现最佳的是<span class="emphasis">${excellentMaxClass}</span>（优秀率${excellentMax.toFixed(2)}%），
        表现最需提升的是<span class="emphasis">${excellentMinClass}</span>（优秀率${excellentMin.toFixed(2)}%）。
    `;
    overallSection.appendChild(overallAnalysis);
    
    // 2. 班级间差异分析
    const differenceSection = document.createElement('div');
    differenceSection.className = 'summary-section';
    
    const differenceHeading = document.createElement('h4');
    differenceHeading.className = 'section-heading';
    differenceHeading.textContent = '班级间差异分析';
    differenceSection.appendChild(differenceHeading);
    
    // 分析班级间差异
    const differenceAnalysis = document.createElement('p');
    
    // 计算分数等级分布的标准差，评估均衡性
    const excellentStdDev = calculateStandardDeviation(levelProportions.excellent);
    const balanceLevel = excellentStdDev > 10 ? "显著差异" : (excellentStdDev > 5 ? "中等差异" : "相对均衡");
    
    differenceAnalysis.innerHTML = `
        <span class="highlight">📈 差异情况：</span>各班级在${selectedSubject}科目的成绩分布呈<span class="emphasis">${balanceLevel}</span>状态。
        优秀率标准差为<span class="emphasis">${excellentStdDev.toFixed(2)}%</span>，
        不及格率最高的班级是<span class="emphasis">${failMaxClass}</span>（${failMax.toFixed(2)}%），
        不及格率最低的班级是<span class="emphasis">${failMinClass}</span>（${failMin.toFixed(2)}%）。
        ${excellentGap > 15 ? `<span class="alert">⚠️ 警示：班级间优秀率差距超过15%，表明教学效果存在明显不均衡现象。</span>` : ''}
    `;
    differenceSection.appendChild(differenceAnalysis);
    
    // 3. 优化建议
    const suggestionsSection = document.createElement('div');
    suggestionsSection.className = 'summary-section';
    
    const suggestionsHeading = document.createElement('h4');
    suggestionsHeading.className = 'section-heading';
    suggestionsHeading.textContent = '优化建议';
    suggestionsSection.appendChild(suggestionsHeading);
    
    // 教学资源调配建议
    const resourceSuggestion = document.createElement('div');
    resourceSuggestion.className = 'suggestion-item';
    resourceSuggestion.innerHTML = `
        <span class="suggestion-title">📚 教学资源调配：</span>
        <p>建议向${excellentMinClass}投入更多教学资源，特别是在${selectedSubject}科目上。可安排经验丰富的教师进行针对性辅导，
        并适当增加课时或补充教学材料。同时，建议从${excellentMaxClass}借鉴成功经验。</p>
    `;
    suggestionsSection.appendChild(resourceSuggestion);
    
    // 根据不及格率提供分层教学建议
    const teachingSuggestion = document.createElement('div');
    teachingSuggestion.className = 'suggestion-item';
    teachingSuggestion.innerHTML = `
        <span class="suggestion-title">👨‍🏫 分层教学策略：</span>
        <p>对于不及格率较高的${failMaxClass}（${failMax.toFixed(2)}%），建议实施分层教学策略，对学习困难学生进行小组辅导，
        设计难度适中的练习材料提升基础能力。可考虑设置"学习伙伴"机制，由优秀学生帮助学习有困难的同学。</p>
    `;
    suggestionsSection.appendChild(teachingSuggestion);
    
    // 优秀班级经验分享建议
    const sharingSuggestion = document.createElement('div');
    sharingSuggestion.className = 'suggestion-item';
    sharingSuggestion.innerHTML = `
        <span class="suggestion-title">🔄 教学经验共享：</span>
        <p>建议组织${excellentMaxClass}的任课教师分享${selectedSubject}教学经验和方法，包括课堂教学技巧、作业设计和学生激励机制等。
        可安排教师间互相听课评课，促进教学方法的交流与改进。</p>
    `;
    suggestionsSection.appendChild(sharingSuggestion);
    
    // 针对性提升策略
    const improvementSuggestion = document.createElement('div');
    improvementSuggestion.className = 'suggestion-item';
    improvementSuggestion.innerHTML = `
        <span class="suggestion-title">🎯 针对性提升策略：</span>
        <p>对于${excellentMinClass}，建议关注"良好"到"优秀"的提升，可针对性强化难点题型训练；
        对于不及格率高的班级，应加强基础知识巩固和学习方法指导，可增设针对性的辅导课程。</p>
    `;
    suggestionsSection.appendChild(improvementSuggestion);
    
    // 评估机制建议
    const evaluationSuggestion = document.createElement('div');
    evaluationSuggestion.className = 'suggestion-item';
    evaluationSuggestion.innerHTML = `
        <span class="suggestion-title">📝 评估机制调整：</span>
        <p>建议增加阶段性、小型的评估测试，及时发现学生在${selectedSubject}学习中的问题并给予反馈。
        考虑建立班级间定期交流和比较机制，激发良性竞争，促进整体提升。</p>
    `;
    suggestionsSection.appendChild(evaluationSuggestion);
    
    // 将所有部分添加到容器中
    container.appendChild(overallSection);
    container.appendChild(differenceSection);
    container.appendChild(suggestionsSection);
    
    return container;
}

/**
 * 计算数组的标准差
 * @param {Array} arr - 数字数组
 * @returns {number} - 标准差
 */
function calculateStandardDeviation(arr) {
    const n = arr.length;
    if (n === 0) return 0;
    
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    return Math.sqrt(variance);
} 