/**
 * 成绩分析系统 - 趋势分析模块
 * 用于分析学生成绩变化趋势并生成总结和建议
 */

/**
 * 为个人成绩变化趋势图生成总结和优化建议
 * @param {Object} student - 学生对象
 * @param {Array} scoreData - 成绩数据
 * @param {string} selectedSubject - 选择的科目
 */
function generateTrendSummaryAndSuggestions(student, scoreData, selectedSubject) {
    console.log('开始生成趋势总结和优化建议');
    if (!scoreData || scoreData.length === 0) {
        console.warn('成绩数据为空，无法生成总结');
        return;
    }

    // 获取分析结果区域
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) return;

    // 创建总结容器
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'trend-summary-container';

    // 对成绩数据按时间排序（确保时间上是有序的）
    scoreData.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return -1;
        if (!b.date) return 1;
        return new Date(a.date) - new Date(b.date);
    });

    // 分析成绩趋势
    const trendAnalysis = analyzeTrend(student, scoreData, selectedSubject);
    
    // 获取分数线设置
    const thresholds = getThresholds();

    // 生成总结和建议
    let summaryHTML = '';
    
    if (Object.keys(trendAnalysis.subjects).length === 0) {
        // 没有足够的数据生成趋势分析
        summaryHTML = `
            <div class="trend-summary-section">
                <div class="summary-header">
                    <h4><i class="fas fa-chart-line"></i> 成绩变化趋势分析总结</h4>
                </div>
                <div class="overall-trend-summary">
                    <p>没有足够的历史成绩数据来生成趋势分析。需要至少两次包含相同科目的考试记录。</p>
                </div>
            </div>
        `;
    } else {
        // 生成科目趋势建议
        const suggestionsBySubject = {};
        
        Object.keys(trendAnalysis.subjects).forEach(subject => {
            const analysis = trendAnalysis.subjects[subject];
            suggestionsBySubject[subject] = generateSubjectTrendSuggestion(analysis, thresholds);
        });
        
        // 渲染趋势总结
        summaryHTML = renderTrendSummary({
            trendAnalysis: trendAnalysis,
            suggestionsBySubject: suggestionsBySubject
        }, student.name);
    }

    // 设置容器内容
    summaryContainer.innerHTML = summaryHTML;

    // 添加到分析结果区域
    analysisResult.appendChild(summaryContainer);

    console.log('趋势总结和优化建议生成完成');
}

/**
 * 分析成绩趋势
 * @param {Object} student - 学生对象
 * @param {Array} scoreData - 成绩数据
 * @param {string} selectedSubject - 选择的科目
 * @returns {Object} 趋势分析结果
 */
function analyzeTrend(student, scoreData, selectedSubject) {
    console.log('分析成绩趋势...');
    
    // 存储分析结果
    const analysis = {
        subjects: {},
        overall: {
            hasImprovement: false,
            hasDecline: false,
            isStable: false,
            volatility: 'low', // 波动性：low, medium, high
            improvementRate: 0,
            initialScores: {},
            finalScores: {},
            maxScores: {},
            minScores: {},
            maxImprovement: 0,
            maxDecline: 0,
            significantChanges: []
        }
    };

    // 如果是分析单一科目
    if (selectedSubject !== 'all') {
        const subjectScores = scoreData.map(data => {
            return {
                examName: data.fileName,
                date: data.date,
                score: data.scores[selectedSubject] || null
            };
        }).filter(item => item.score !== null);

        if (subjectScores.length >= 2) {
            analysis.subjects[selectedSubject] = analyzeSubjectTrend(selectedSubject, subjectScores);
        } else {
            console.warn(`${selectedSubject}科目有效成绩数据不足，无法进行趋势分析`);
        }
    } else {
        // 分析所有科目
        // 获取所有考试中出现的科目
        const allSubjects = new Set();
        scoreData.forEach(data => {
            Object.keys(data.scores).forEach(subject => {
                if (data.scores[subject] !== null) {
                    allSubjects.add(subject);
                }
            });
        });

        // 对每个科目进行分析
        allSubjects.forEach(subject => {
            const subjectScores = scoreData.map(data => {
                return {
                    examName: data.fileName,
                    date: data.date,
                    score: data.scores[subject] || null
                };
            }).filter(item => item.score !== null);

            if (subjectScores.length >= 2) {
                analysis.subjects[subject] = analyzeSubjectTrend(subject, subjectScores);
                
                // 更新总体分析数据
                const subjectAnalysis = analysis.subjects[subject];
                
                // 记录初始分数和最终分数
                analysis.overall.initialScores[subject] = subjectScores[0].score;
                analysis.overall.finalScores[subject] = subjectScores[subjectScores.length - 1].score;
                
                // 记录最高分和最低分
                analysis.overall.maxScores[subject] = Math.max(...subjectScores.map(s => s.score));
                analysis.overall.minScores[subject] = Math.min(...subjectScores.map(s => s.score));
                
                // 更新整体趋势信息
                if (subjectAnalysis.trend === 'improving') {
                    analysis.overall.hasImprovement = true;
                } else if (subjectAnalysis.trend === 'declining') {
                    analysis.overall.hasDecline = true;
                } else if (subjectAnalysis.trend === 'stable') {
                    analysis.overall.isStable = true;
                }
                
                // 记录最大提升和下降
                if (subjectAnalysis.totalChange > analysis.overall.maxImprovement) {
                    analysis.overall.maxImprovement = subjectAnalysis.totalChange;
                }
                if (subjectAnalysis.totalChange < analysis.overall.maxDecline) {
                    analysis.overall.maxDecline = subjectAnalysis.totalChange;
                }
                
                // 记录显著变化
                if (Math.abs(subjectAnalysis.totalChange) >= 10) {
                    analysis.overall.significantChanges.push({
                        subject: subject,
                        change: subjectAnalysis.totalChange
                    });
                }
            }
        });
        
        // 计算整体提升率
        const subjectCount = Object.keys(analysis.subjects).length;
        if (subjectCount > 0) {
            const improvingSubjects = Object.values(analysis.subjects).filter(s => s.trend === 'improving').length;
            analysis.overall.improvementRate = (improvingSubjects / subjectCount * 100).toFixed(1);
        }
        
        // 分析整体波动性
        const volatilityScores = Object.values(analysis.subjects).map(s => s.volatility);
        const highVolatilityCount = volatilityScores.filter(v => v === 'high').length;
        const mediumVolatilityCount = volatilityScores.filter(v => v === 'medium').length;
        
        if (highVolatilityCount >= subjectCount / 3) {
            analysis.overall.volatility = 'high';
        } else if (mediumVolatilityCount + highVolatilityCount >= subjectCount / 2) {
            analysis.overall.volatility = 'medium';
        } else {
            analysis.overall.volatility = 'low';
        }
    }

    console.log('趋势分析结果:', analysis);
    return analysis;
}

/**
 * 分析单个科目的成绩趋势
 * @param {string} subject - 科目名称
 * @param {Array} scores - 科目成绩数据
 * @returns {Object} 科目趋势分析结果
 */
function analyzeSubjectTrend(subject, scores) {
    const analysis = {
        subject: subject,
        trend: 'unknown', // improving, declining, stable, fluctuating
        totalChange: 0,
        averageChange: 0,
        initialScore: scores[0].score,
        finalScore: scores[scores.length - 1].score,
        maxScore: Math.max(...scores.map(s => s.score)),
        minScore: Math.min(...scores.map(s => s.score)),
        volatility: 'low', // low, medium, high
        changePoints: []
    };

    // 计算总变化量
    analysis.totalChange = analysis.finalScore - analysis.initialScore;
    
    // 计算每次考试间的变化
    let totalAbsoluteChange = 0;
    const changes = [];
    
    for (let i = 1; i < scores.length; i++) {
        const change = scores[i].score - scores[i-1].score;
        changes.push(change);
        totalAbsoluteChange += Math.abs(change);
        
        // 如果变化超过5分，记录为变化点
        if (Math.abs(change) >= 5) {
            analysis.changePoints.push({
                from: scores[i-1].examName,
                to: scores[i].examName,
                change: change
            });
        }
    }
    
    // 计算平均变化量
    analysis.averageChange = changes.length > 0 ? (analysis.totalChange / changes.length) : 0;
    
    // 确定趋势
    if (analysis.totalChange > 5) {
        analysis.trend = 'improving';
    } else if (analysis.totalChange < -5) {
        analysis.trend = 'declining';
    } else {
        // 检查波动性
        const scoreRange = analysis.maxScore - analysis.minScore;
        if (scoreRange < 5) {
            analysis.trend = 'stable';
        } else {
            analysis.trend = 'fluctuating';
        }
    }
    
    // 计算波动性
    const averageAbsoluteChange = changes.length > 0 ? (totalAbsoluteChange / changes.length) : 0;
    const scoreRange = analysis.maxScore - analysis.minScore;
    
    if (averageAbsoluteChange >= 8 || scoreRange >= 15) {
        analysis.volatility = 'high';
    } else if (averageAbsoluteChange >= 4 || scoreRange >= 8) {
        analysis.volatility = 'medium';
    } else {
        analysis.volatility = 'low';
    }
    
    return analysis;
}

/**
 * 生成单科目趋势建议
 * @param {Object} analysis - 科目趋势分析结果
 * @param {Object} thresholds - 分数线设置
 * @returns {string} 科目建议文本
 */
function generateSubjectTrendSuggestion(analysis, thresholds) {
    let suggestion = '';

    // 根据趋势生成建议
    if (analysis.trend === 'improving') {
        if (analysis.volatility === 'low') {
            suggestion = `${analysis.subject}成绩呈稳步上升趋势，继续保持当前学习方法和习惯。`;
        } else if (analysis.volatility === 'medium') {
            suggestion = `${analysis.subject}成绩整体呈上升趋势，但波动较大，建议更加稳定地复习和巩固知识点。`;
        } else {
            suggestion = `${analysis.subject}成绩虽有提升但波动很大，建议查找造成大幅波动的原因，保持学习节奏的一致性。`;
        }

        // 根据最终分数与分数线的关系补充建议
        if (analysis.finalScore < thresholds.passScore) {
            suggestion += `当前分数(${analysis.finalScore}分)仍未达到及格线(${thresholds.passScore}分)，需继续加强基础知识学习。`;
        } else if (analysis.finalScore < thresholds.goodScore) {
            suggestion += `当前已达到及格水平(${analysis.finalScore}分)，但距离良好线(${thresholds.goodScore}分)还有差距，建议巩固重点难点。`;
        } else if (analysis.finalScore < thresholds.excellentScore) {
            suggestion += `已达到良好水平(${analysis.finalScore}分)，可以冲刺优秀(${thresholds.excellentScore}分)，重点关注解题技巧和高难度内容。`;
        } else {
            suggestion += `已达到优秀水平(${analysis.finalScore}分)，建议保持并挑战更高难度的题目，拓展知识面。`;
        }
    } else if (analysis.trend === 'declining') {
        if (analysis.volatility === 'low') {
            suggestion = `${analysis.subject}成绩呈现缓慢下降趋势，建议及时调整学习方法，加强对该科目的重视度。`;
        } else if (analysis.volatility === 'medium') {
            suggestion = `${analysis.subject}成绩整体下降且波动明显，需要找出学习中的薄弱环节，系统性地进行知识梳理。`;
        } else {
            suggestion = `${analysis.subject}成绩大幅波动且整体下滑，建议寻求老师帮助，分析具体原因并制定专项提升计划。`;
        }

        // 添加具体的挽回策略
        suggestion += `建议分析下降幅度最大的考试(`;
        if (analysis.changePoints.length > 0) {
            const biggestDecline = analysis.changePoints
                .filter(cp => cp.change < 0)
                .sort((a, b) => a.change - b.change)[0];
            
            if (biggestDecline) {
                suggestion += `从${biggestDecline.from}到${biggestDecline.to}，下降了${Math.abs(biggestDecline.change)}分)`;
            } else {
                suggestion += `整体趋势性下降`;
            }
        } else {
            suggestion += `整体趋势性下降`;
        }
        suggestion += `，找出考试失分点进行专项训练。`;
    } else if (analysis.trend === 'stable') {
        suggestion = `${analysis.subject}成绩保持稳定，在${analysis.minScore}-${analysis.maxScore}分之间。`;
        
        // 根据稳定的分数水平提供建议
        if (analysis.finalScore < thresholds.passScore) {
            suggestion += `当前稳定在不及格水平，建议尝试新的学习方法，增加学习时间，重点关注基础知识。`;
        } else if (analysis.finalScore < thresholds.goodScore) {
            suggestion += `稳定在及格水平，建议提高学习效率，掌握更多解题技巧，向良好水平冲刺。`;
        } else if (analysis.finalScore < thresholds.excellentScore) {
            suggestion += `稳定在良好水平，可以尝试更有挑战的习题，深入理解知识点间的联系，突破到优秀水平。`;
        } else {
            suggestion += `稳定在优秀水平，建议保持当前学习状态，可以适当拓展学科知识，培养创新思维。`;
        }
    } else if (analysis.trend === 'fluctuating') {
        suggestion = `${analysis.subject}成绩波动较大，最高${analysis.maxScore}分，最低${analysis.minScore}分。这可能反映出学习不够系统或应试状态不稳定。`;
        
        // 分析波动原因和改进策略
        if (analysis.changePoints.length > 0) {
            suggestion += `特别是在`;
            const significantChanges = analysis.changePoints
                .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                .slice(0, 2);
            
            significantChanges.forEach((change, index) => {
                if (index > 0) suggestion += '和';
                suggestion += `${change.from}到${change.to}(${change.change > 0 ? '上升' : '下降'}了${Math.abs(change.change)}分)`;
            });
            
            suggestion += `的考试中变化明显，建议分析这些考试的差异点。`;
        }
        
        suggestion += `建议建立系统的知识体系，保持复习的连续性，提高应试的稳定性。`;
    }

    return suggestion;
}

/**
 * 渲染趋势总结和建议
 * @param {Object} summary - 总结对象
 * @param {string} studentName - 学生姓名
 * @returns {string} HTML内容
 */
function renderTrendSummary(summary, studentName) {
    const { trendAnalysis, suggestionsBySubject } = summary;
    const { subjects, overall } = trendAnalysis;
    
    // 生成总体趋势描述
    let overallTrendDescription = '';
    const subjectCount = Object.keys(subjects).length;
    
    if (subjectCount === 1) {
        // 单科目分析
        const subjectName = Object.keys(subjects)[0];
        const subjectAnalysis = subjects[subjectName];
        
        if (subjectAnalysis.trend === 'improving') {
            overallTrendDescription = `${studentName}同学的${subjectName}成绩整体呈上升趋势，从初始的${subjectAnalysis.initialScore}分提升到${subjectAnalysis.finalScore}分，总共提升了${subjectAnalysis.totalChange.toFixed(1)}分。`;
        } else if (subjectAnalysis.trend === 'declining') {
            overallTrendDescription = `${studentName}同学的${subjectName}成绩整体呈下降趋势，从初始的${subjectAnalysis.initialScore}分下降到${subjectAnalysis.finalScore}分，总共下降了${Math.abs(subjectAnalysis.totalChange).toFixed(1)}分。`;
        } else if (subjectAnalysis.trend === 'stable') {
            overallTrendDescription = `${studentName}同学的${subjectName}成绩保持稳定，基本维持在${(subjectAnalysis.maxScore + subjectAnalysis.minScore) / 2}分左右，波动范围较小。`;
        } else {
            overallTrendDescription = `${studentName}同学的${subjectName}成绩波动较大，最高达到${subjectAnalysis.maxScore}分，最低为${subjectAnalysis.minScore}分，需要关注成绩的稳定性。`;
        }
    } else {
        // 多科目分析
        const improvingSubjects = Object.values(subjects).filter(s => s.trend === 'improving').length;
        const decliningSubjects = Object.values(subjects).filter(s => s.trend === 'declining').length;
        const stableSubjects = Object.values(subjects).filter(s => s.trend === 'stable').length;
        const fluctuatingSubjects = Object.values(subjects).filter(s => s.trend === 'fluctuating').length;
        
        overallTrendDescription = `${studentName}同学的成绩变化分析显示，在${subjectCount}个科目中，有${improvingSubjects}个科目呈上升趋势，${decliningSubjects}个科目呈下降趋势，${stableSubjects}个科目保持稳定，${fluctuatingSubjects}个科目波动较大。`;
        
        // 添加显著变化的科目
        if (overall.significantChanges.length > 0) {
            overallTrendDescription += ' 其中变化最显著的科目是';
            overall.significantChanges
                .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                .slice(0, 2)
                .forEach((change, index) => {
                    if (index > 0) overallTrendDescription += '和';
                    overallTrendDescription += `${change.subject}(${change.change > 0 ? '提升' : '下降'}了${Math.abs(change.change).toFixed(1)}分)`;
                });
            overallTrendDescription += '。';
        }
        
        // 根据整体趋势添加总结
        if (improvingSubjects > decliningSubjects && improvingSubjects > subjectCount / 2) {
            overallTrendDescription += ` 整体学习状态良好，大部分科目都有进步。`;
        } else if (decliningSubjects > improvingSubjects && decliningSubjects > subjectCount / 2) {
            overallTrendDescription += ` 整体学习状态需要改进，多数科目呈下降趋势。`;
        } else if (stableSubjects > subjectCount / 2) {
            overallTrendDescription += ` 整体学习状态稳定，但缺乏明显进步。`;
        } else {
            overallTrendDescription += ` 各科目发展不均衡，需要更平衡的学习策略。`;
        }
    }
    
    // 生成科目建议HTML
    const subjectSuggestionsHtml = Object.keys(suggestionsBySubject).map(subject => {
        const suggestion = suggestionsBySubject[subject];
        const subjectAnalysis = subjects[subject];
        
        // 确定标签颜色
        let trendColor = '';
        if (subjectAnalysis.trend === 'improving') {
            trendColor = 'trend-improving';
        } else if (subjectAnalysis.trend === 'declining') {
            trendColor = 'trend-declining';
        } else if (subjectAnalysis.trend === 'stable') {
            trendColor = 'trend-stable';
        } else {
            trendColor = 'trend-fluctuating';
        }
        
        return `
            <div class="subject-trend-suggestion">
                <div class="subject-trend-header">
                    <h5>${subject}</h5>
                    <span class="trend-badge ${trendColor}">
                        ${subjectAnalysis.trend === 'improving' ? '上升' : 
                         subjectAnalysis.trend === 'declining' ? '下降' : 
                         subjectAnalysis.trend === 'stable' ? '稳定' : '波动'}
                    </span>
                </div>
                <div class="subject-trend-scores">
                    <span class="trend-score-item">
                        <i class="fas fa-play"></i> 初始: ${subjectAnalysis.initialScore}分
                    </span>
                    <span class="trend-score-item">
                        <i class="fas fa-flag-checkered"></i> 最新: ${subjectAnalysis.finalScore}分
                    </span>
                    <span class="trend-score-item">
                        <i class="fas fa-arrow-${subjectAnalysis.totalChange >= 0 ? 'up' : 'down'}"></i> 
                        变化: ${subjectAnalysis.totalChange > 0 ? '+' : ''}${subjectAnalysis.totalChange.toFixed(1)}分
                    </span>
                </div>
                <p class="subject-trend-suggestion-text">${suggestion}</p>
            </div>
        `;
    }).join('');
    
    // 生成整体学习策略建议
    let overallStrategyHtml = '';
    if (subjectCount > 1) {
        // 多科目情况下提供整体策略
        const { improvementRate, volatility } = overall;
        
        let strategies = [];
        
        // 根据整体提升率提供建议
        if (improvementRate >= 70) {
            strategies.push({
                title: "保持优秀学习态势",
                content: "继续保持当前的学习方法和状态，定期复习巩固知识点，适当增加学习难度和深度。"
            });
        } else if (improvementRate >= 50) {
            strategies.push({
                title: "巩固进步态势",
                content: "大部分科目都有进步，继续保持积极学习态度，加强对下降科目的关注，实现更全面的提高。"
            });
        } else if (improvementRate >= 30) {
            strategies.push({
                title: "提高整体进步率",
                content: "部分科目有进步，但整体提升空间较大，建议平衡各科投入时间，重点关注下降明显的科目。"
            });
        } else {
            strategies.push({
                title: "全面调整学习方法",
                content: "大多数科目缺乏明显进步，建议重新评估学习方法和时间分配，寻求更有效的学习策略。"
            });
        }
        
        // 根据波动性提供建议
        if (volatility === 'high') {
            strategies.push({
                title: "提高学习稳定性",
                content: "成绩波动较大，建议保持学习的连续性和系统性，制定详细的学习计划并严格执行，减少临时抱佛脚。"
            });
        } else if (volatility === 'medium') {
            strategies.push({
                title: "增强知识连贯性",
                content: "成绩有一定波动，建议注重知识点之间的联系，及时复习巩固，保持学习的连续性。"
            });
        } else {
            strategies.push({
                title: "保持学习稳定性",
                content: "成绩波动较小，学习状态稳定，可以适当提高学习难度和深度，挑战自我。"
            });
        }
        
        // 添加时间管理建议
        strategies.push({
            title: "优化时间分配",
            content: "根据各科目表现，合理调整学习时间分配，对表现下降的科目增加投入，同时保持优势科目的水平。"
        });
        
        // 生成策略HTML
        overallStrategyHtml = strategies.map(strategy => `
            <div class="trend-strategy-item">
                <h5><i class="fas fa-lightbulb"></i> ${strategy.title}</h5>
                <p>${strategy.content}</p>
            </div>
        `).join('');
    }
    
    // 拼接完整HTML
    return `
        <div class="trend-summary-section">
            <div class="summary-header">
                <h4><i class="fas fa-chart-line"></i> 成绩变化趋势分析总结</h4>
            </div>
            <div class="overall-trend-summary">
                <p>${overallTrendDescription}</p>
            </div>
            
            <div class="subject-trend-suggestions-section">
                <h4><i class="fas fa-chalkboard-teacher"></i> 科目趋势分析与建议</h4>
                <div class="subject-trend-suggestions">
                    ${subjectSuggestionsHtml}
                </div>
            </div>
            
            ${subjectCount > 1 ? `
            <div class="trend-strategies-section">
                <h4><i class="fas fa-brain"></i> 整体学习策略建议</h4>
                <div class="trend-strategies">
                    ${overallStrategyHtml}
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

// 导出模块函数
window.TrendAnalysis = {
    generateTrendSummaryAndSuggestions
};

/**
 * 为班级分数等级占比分析生成总结和优化建议
 * @param {Object} fileData - 文件数据
 * @param {string} subject - 科目名称
 * @param {Object} levelData - 分数等级数据
 * @param {Object} thresholds - 分数线设置
 */
function generateLevelProportionSummaryAndSuggestions(fileData, subject, levelData, thresholds) {
    console.log('开始生成班级分数等级占比分析总结和优化建议');
    
    // 获取分析结果区域
    const analysisResult = document.getElementById('analysisResult');
    if (!analysisResult) return;

    // 创建总结容器
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'trend-summary-container';

    // 分析分数等级分布
    const levelAnalysis = analyzeLevelDistribution(levelData, subject, thresholds);
    
    // 生成优化建议
    const suggestions = generateLevelDistributionSuggestions(levelAnalysis, subject, thresholds);

    // 渲染总结和建议
    summaryContainer.innerHTML = renderLevelDistributionSummary(levelAnalysis, suggestions, fileData.name, subject);

    // 添加到分析结果区域
    analysisResult.appendChild(summaryContainer);

    console.log('班级分数等级占比分析总结和优化建议生成完成');
}

/**
 * 分析分数等级分布情况
 * @param {Object} levelData - 分数等级数据
 * @param {string} subject - 科目名称
 * @param {Object} thresholds - 分数线设置
 * @returns {Object} 分析结果
 */
function analyzeLevelDistribution(levelData, subject, thresholds) {
    // 提取数据
    const { excellentCount, goodCount, passCount, failCount, totalCount } = levelData;
    const excellentRate = (excellentCount / totalCount * 100).toFixed(1);
    const goodRate = (goodCount / totalCount * 100).toFixed(1);
    const passRate = (passCount / totalCount * 100).toFixed(1);
    const failRate = (failCount / totalCount * 100).toFixed(1);
    
    // 分析结果
    const analysis = {
        subject: subject,
        distribution: {
            excellent: { count: excellentCount, rate: excellentRate },
            good: { count: goodCount, rate: goodRate },
            pass: { count: passCount, rate: passRate },
            fail: { count: failCount, rate: failRate }
        },
        totalCount: totalCount,
        overallPerformance: '',
        strengths: [],
        weaknesses: [],
        balanceLevel: ''
    };
    
    // 判断整体表现
    if (excellentRate >= 30) {
        analysis.overallPerformance = '优秀';
        analysis.strengths.push('优秀率较高');
    } else if (excellentRate >= 20) {
        analysis.overallPerformance = '良好';
        analysis.strengths.push('优秀率达到了较好水平');
    } else if (excellentRate < 10) {
        analysis.overallPerformance = '一般';
        analysis.weaknesses.push('优秀率较低');
    }
    
    if (failRate <= 5) {
        if (analysis.overallPerformance !== '优秀') {
            analysis.overallPerformance = '良好';
        }
        analysis.strengths.push('不及格率很低');
    } else if (failRate >= 20) {
        analysis.overallPerformance = '需要改进';
        analysis.weaknesses.push('不及格率较高');
    }
    
    // 如果还没有确定整体表现
    if (!analysis.overallPerformance) {
        if (passRate >= 90) {
            analysis.overallPerformance = '良好';
            analysis.strengths.push('及格率很高');
        } else if (passRate < 80) {
            analysis.overallPerformance = '需要改进';
            analysis.weaknesses.push('及格率较低');
        } else {
            analysis.overallPerformance = '一般';
        }
    }
    
    // 评估分布平衡性
    const rateArray = [parseFloat(excellentRate), parseFloat(goodRate), parseFloat(passRate), parseFloat(failRate)];
    const maxRate = Math.max(...rateArray);
    const minRate = Math.min(...rateArray);
    const rateRange = maxRate - minRate;
    
    if (rateRange < 15) {
        analysis.balanceLevel = '均衡';
    } else if (rateRange < 30) {
        analysis.balanceLevel = '较均衡';
    } else if (rateRange < 50) {
        analysis.balanceLevel = '不均衡';
    } else {
        analysis.balanceLevel = '极不均衡';
    }
    
    // 标识主要等级
    const rateMap = {
        excellent: parseFloat(excellentRate),
        good: parseFloat(goodRate),
        pass: parseFloat(passRate),
        fail: parseFloat(failRate)
    };
    
    // 找出最高比例的等级
    let maxRateLevel = 'excellent';
    for (const level in rateMap) {
        if (rateMap[level] > rateMap[maxRateLevel]) {
            maxRateLevel = level;
        }
    }
    
    analysis.dominantLevel = maxRateLevel;
    
    return analysis;
}

/**
 * 生成分数等级分布优化建议
 * @param {Object} analysis - 分析结果
 * @param {string} subject - 科目名称
 * @param {Object} thresholds - 分数线设置
 * @returns {Array} 建议列表
 */
function generateLevelDistributionSuggestions(analysis, subject, thresholds) {
    const suggestions = [];
    const { distribution, dominantLevel, balanceLevel, weaknesses } = analysis;
    
    // 基于优秀率的建议
    if (parseFloat(distribution.excellent.rate) < 15) {
        suggestions.push({
            title: `提高${subject}优秀率`,
            content: `当前优秀率为${distribution.excellent.rate}%，较低。建议加强优秀生培养，提供挑战性习题，激发学习兴趣，组织小组讨论分享学习方法，强化重点难点内容掌握。`
        });
    } else if (parseFloat(distribution.excellent.rate) >= 40) {
        suggestions.push({
            title: `保持${subject}优秀率`,
            content: `当前优秀率为${distribution.excellent.rate}%，处于较高水平。建议保持现有教学策略，可适当提高教学难度和深度，拓展知识面，培养学生创新思维和解题能力。`
        });
    }
    
    // 基于不及格率的建议
    if (parseFloat(distribution.fail.rate) >= 15) {
        suggestions.push({
            title: `降低${subject}不及格率`,
            content: `当前不及格率为${distribution.fail.rate}%，较高。建议针对学困生制定个性化辅导计划，补充基础知识，简化教学内容，增加课堂互动，采用多样化教学方法，强化基础知识点训练。`
        });
    }
    
    // 基于分布均衡性的建议
    if (balanceLevel === '不均衡' || balanceLevel === '极不均衡') {
        suggestions.push({
            title: `平衡${subject}成绩分布`,
            content: `当前成绩分布${balanceLevel}，主要集中在${translateLevel(dominantLevel)}等级(${distribution[dominantLevel].rate}%)。建议实施分层教学，针对不同水平学生制定不同难度的学习目标和教学策略，确保各层次学生都能获得相应提升。`
        });
    }
    
    // 如果没有足够的建议，增加通用建议
    if (suggestions.length < 2) {
        if (parseFloat(distribution.good.rate) < 20) {
            suggestions.push({
                title: `提高${subject}良好率`,
                content: `当前良好率为${distribution.good.rate}%，可通过加强中等生培养，提供针对性辅导，帮助其突破到良好水平，实现整体水平提升。`
            });
        }
    }
    
    // 确保至少有两条建议
    if (suggestions.length < 2) {
        suggestions.push({
            title: `优化${subject}教学策略`,
            content: `根据班级${subject}成绩分布情况，建议结合教材内容调整教学策略，关注学生学习过程，及时发现并解决学习中的困难，培养学生自主学习能力。`
        });
    }
    
    // 增加教学方法建议
    suggestions.push({
        title: "教学方法调整建议",
        content: `针对${subject}学科特点，可尝试以下教学方法：采用项目式学习激发兴趣，通过小组合作学习促进互助，利用多媒体资源丰富教学内容，适当增加实践活动巩固理论知识，定期进行阶段性测试及时调整教学策略。`
    });
    
    return suggestions;
}

/**
 * 渲染分数等级分布总结和建议
 * @param {Object} analysis - 分析结果
 * @param {Array} suggestions - 建议列表
 * @param {string} fileName - 文件名称
 * @param {string} subject - 科目名称
 * @returns {string} HTML内容
 */
function renderLevelDistributionSummary(analysis, suggestions, fileName, subject) {
    const { distribution, totalCount, overallPerformance, strengths, weaknesses, balanceLevel } = analysis;
    
    // 生成优势和劣势列表
    let strengthsHtml = '';
    if (strengths.length > 0) {
        strengthsHtml = strengths.map(item => `<li>${item}</li>`).join('');
    } else {
        strengthsHtml = '<li>暂无明显优势点</li>';
    }
    
    let weaknessesHtml = '';
    if (weaknesses.length > 0) {
        weaknessesHtml = weaknesses.map(item => `<li>${item}</li>`).join('');
    } else {
        weaknessesHtml = '<li>暂无明显不足点</li>';
    }
    
    // 生成建议HTML
    const suggestionsHtml = suggestions.map(item => `
        <div class="trend-strategy-item">
            <h5><i class="fas fa-lightbulb"></i> ${item.title}</h5>
            <p>${item.content}</p>
        </div>
    `).join('');
    
    // 拼接完整HTML
    return `
        <div class="trend-summary-section">
            <div class="summary-header">
                <h4><i class="fas fa-chart-pie"></i> ${subject}成绩等级分布分析总结</h4>
            </div>
            <div class="overall-trend-summary">
                <p>${fileName}中${subject}科目共有${totalCount}名学生，成绩整体表现${overallPerformance}。优秀率${distribution.excellent.rate}%（${distribution.excellent.count}人），良好率${distribution.good.rate}%（${distribution.good.count}人），及格率${distribution.pass.rate}%（${distribution.pass.count}人），不及格率${distribution.fail.rate}%（${distribution.fail.count}人）。成绩分布${balanceLevel}。</p>
            </div>
            
            <div class="summary-details">
                <div class="summary-column">
                    <div class="summary-card strengths-card">
                        <h4><i class="fas fa-star"></i> 班级优势</h4>
                        <ul class="strengths-list">
                            ${strengthsHtml}
                        </ul>
                    </div>
                    <div class="summary-card weaknesses-card">
                        <h4><i class="fas fa-exclamation-triangle"></i> 需改进方面</h4>
                        <ul class="weaknesses-list">
                            ${weaknessesHtml}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="trend-strategies-section">
                <h4><i class="fas fa-brain"></i> 教学优化建议</h4>
                <div class="trend-strategies">
                    ${suggestionsHtml}
                </div>
            </div>
        </div>
    `;
}

/**
 * 等级翻译成中文
 * @param {string} level - 等级
 * @returns {string} 中文等级名称
 */
function translateLevel(level) {
    const levelMap = {
        excellent: '优秀',
        good: '良好',
        pass: '及格',
        fail: '不及格'
    };
    return levelMap[level] || level;
}

// 扩展导出模块函数
window.TrendAnalysis.generateLevelProportionSummaryAndSuggestions = generateLevelProportionSummaryAndSuggestions;
window.TrendAnalysis.generateClassAverageTrendSummaryAndSuggestions = generateClassAverageTrendSummaryAndSuggestions;
window.TrendAnalysis.renderClassAverageTrendSummary = renderClassAverageTrendSummary;

/**
 * 为班级平均分变化趋势分析生成总结和优化建议
 * @param {Array} filesData - 文件数据数组
 * @param {string} selectedSubject - 选择的科目
 * @param {Array} averageScores - 平均分数据数组
 */
function generateClassAverageTrendSummaryAndSuggestions(filesData, selectedSubject, averageScores) {
    console.log('开始生成班级平均分变化趋势总结和优化建议');
    if (!filesData || filesData.length < 2) {
        console.warn('文件数据不足，无法生成趋势总结');
        return null;
    }

    // 获取分数线设置
    const thresholds = getThresholds();
    
    // 分析结果对象
    const analysis = {
        overview: {
            subject: selectedSubject,
            trend: 'stable', // 可能的值: improving, declining, stable, fluctuating
            averageChange: 0,
            totalChange: 0,
            initialScore: 0,
            finalScore: 0,
            maxScore: 0,
            minScore: 0,
            volatility: 'low' // 可能的值: low, medium, high
        },
        trends: [],
        suggestions: []
    };
    
    // 准备数据
    let validScores = [];
    let examNames = [];
    
    if (selectedSubject === 'all') {
        // 所有科目的情况下，需要分别计算每个科目的趋势
        // 获取所有科目
        const allSubjects = new Set();
        filesData.forEach(fileData => {
            const subjects = getSubjectsFromFile(fileData);
            subjects.forEach(subject => allSubjects.add(subject));
        });
        
        // 分析每个科目的趋势
        allSubjects.forEach(subject => {
            const subjectData = [];
            const subjectExamNames = [];
            
            // 计算每个文件中该科目的平均分
            filesData.forEach(fileData => {
                // 获取科目列索引
                const headers = fileData.data[0];
                const subjectIndex = headers.findIndex(header => header === subject);
                
                // 如果找到该科目，计算平均分
                if (subjectIndex !== -1) {
                    let sum = 0;
                    let count = 0;
                    
                    for (let i = 1; i < fileData.data.length; i++) {
                        const row = fileData.data[i];
                        if (row[subjectIndex] !== undefined && row[subjectIndex] !== null && !isNaN(row[subjectIndex])) {
                            sum += parseFloat(row[subjectIndex]);
                            count++;
                        }
                    }
                    
                    // 计算平均分
                    if (count > 0) {
                        const average = (sum / count).toFixed(2);
                        subjectData.push(parseFloat(average));
                        subjectExamNames.push(fileData.name || '未命名');
                    }
                }
            });
            
            // 如果有足够的数据点，分析该科目的趋势
            if (subjectData.length >= 2) {
                const subjectTrend = analyzeAverageTrend(subject, subjectData, subjectExamNames);
                analysis.trends.push(subjectTrend);
            }
        });
        
        // 综合所有科目的趋势，确定整体趋势
        if (analysis.trends.length > 0) {
            const improvingCount = analysis.trends.filter(t => t.trend === 'improving').length;
            const decliningCount = analysis.trends.filter(t => t.trend === 'declining').length;
            const fluctuatingCount = analysis.trends.filter(t => t.trend === 'fluctuating').length;
            
            const totalCount = analysis.trends.length;
            
            if (improvingCount > totalCount / 2) {
                analysis.overview.trend = 'improving';
            } else if (decliningCount > totalCount / 2) {
                analysis.overview.trend = 'declining';
            } else if (fluctuatingCount > totalCount / 3) {
                analysis.overview.trend = 'fluctuating';
            } else {
                analysis.overview.trend = 'stable';
            }
            
            // 计算平均变化率
            let totalChange = 0;
            analysis.trends.forEach(t => {
                totalChange += t.totalChange;
            });
            
            analysis.overview.averageChange = (totalChange / totalCount).toFixed(2);
            analysis.overview.totalChange = totalChange.toFixed(2);
            
            // 确定波动性
            const highVolatilityCount = analysis.trends.filter(t => t.volatility === 'high').length;
            const mediumVolatilityCount = analysis.trends.filter(t => t.volatility === 'medium').length;
            
            if (highVolatilityCount > totalCount / 3) {
                analysis.overview.volatility = 'high';
            } else if (mediumVolatilityCount + highVolatilityCount > totalCount / 2) {
                analysis.overview.volatility = 'medium';
            } else {
                analysis.overview.volatility = 'low';
            }
        }
    } else {
        // 单科目分析
        filesData.forEach(fileData => {
            // 获取科目列索引
            const headers = fileData.data[0];
            const subjectIndex = headers.findIndex(header => header === selectedSubject);
            
            // 如果找到该科目，计算平均分
            if (subjectIndex !== -1) {
                let sum = 0;
                let count = 0;
                
                for (let i = 1; i < fileData.data.length; i++) {
                    const row = fileData.data[i];
                    if (row[subjectIndex] !== undefined && row[subjectIndex] !== null && !isNaN(row[subjectIndex])) {
                        sum += parseFloat(row[subjectIndex]);
                        count++;
                    }
                }
                
                // 计算平均分
                if (count > 0) {
                    const average = (sum / count).toFixed(2);
                    validScores.push(parseFloat(average));
                    examNames.push(fileData.name || '未命名');
                }
            }
        });
        
        // 如果有足够的数据点，分析趋势
        if (validScores.length >= 2) {
            const subjectTrend = analyzeAverageTrend(selectedSubject, validScores, examNames);
            analysis.trends.push(subjectTrend);
            
            // 单科目时，总览等于该科目的趋势
            analysis.overview = {
                subject: selectedSubject,
                trend: subjectTrend.trend,
                averageChange: subjectTrend.averageChange,
                totalChange: subjectTrend.totalChange,
                initialScore: subjectTrend.initialScore,
                finalScore: subjectTrend.finalScore,
                maxScore: subjectTrend.maxScore,
                minScore: subjectTrend.minScore,
                volatility: subjectTrend.volatility
            };
        }
    }
    
    // 生成优化建议
    analysis.suggestions = generateAverageTrendSuggestions(analysis, thresholds);
    
    console.log('班级平均分变化趋势分析结果:', analysis);
    return analysis;
}

/**
 * 分析平均分变化趋势
 * @param {string} subject - 科目名称
 * @param {Array} scores - 平均分数组
 * @param {Array} examNames - 考试名称数组
 * @returns {Object} 趋势分析结果
 */
function analyzeAverageTrend(subject, scores, examNames) {
    const trend = {
        subject: subject,
        examNames: examNames,
        scores: scores,
        trend: 'stable', // 可能的值: improving, declining, stable, fluctuating
        volatility: 'low', // 可能的值: low, medium, high
        initialScore: scores[0],
        finalScore: scores[scores.length - 1],
        maxScore: Math.max(...scores),
        minScore: Math.min(...scores),
        totalChange: (scores[scores.length - 1] - scores[0]).toFixed(2),
        averageChange: 0,
        changePoints: []
    };
    
    // 计算平均变化率
    let totalChange = 0;
    const changes = [];
    
    for (let i = 1; i < scores.length; i++) {
        const change = scores[i] - scores[i-1];
        changes.push(change);
        totalChange += change;
        
        // 如果变化超过3分，记录为变化点
        if (Math.abs(change) >= 3) {
            trend.changePoints.push({
                from: examNames[i-1],
                to: examNames[i],
                change: change.toFixed(2)
            });
        }
    }
    
    trend.averageChange = (totalChange / (scores.length - 1)).toFixed(2);
    
    // 判断趋势类型
    // 如果总变化超过5分，且变化方向一致，判断为上升或下降趋势
    if (Math.abs(trend.totalChange) >= 5) {
        if (trend.totalChange > 0) {
            // 检查是否所有变化点都是正的
            const allPositive = changes.every(change => change >= 0);
            trend.trend = allPositive ? 'improving' : 'fluctuating';
        } else {
            // 检查是否所有变化点都是负的
            const allNegative = changes.every(change => change <= 0);
            trend.trend = allNegative ? 'declining' : 'fluctuating';
        }
    } else if (Math.abs(trend.totalChange) < 3) {
        // 总变化小于3分，认为是稳定的
        trend.trend = 'stable';
    } else {
        // 其他情况，看波动性
        const changesSq = changes.map(c => c * c);
        const variance = changesSq.reduce((sum, sq) => sum + sq, 0) / changes.length;
        
        if (variance > 25) { // 标准差大于5
            trend.trend = 'fluctuating';
            trend.volatility = 'high';
        } else if (variance > 9) { // 标准差大于3
            trend.volatility = 'medium';
            trend.trend = Math.abs(trend.totalChange) >= 3 ? 
                (trend.totalChange > 0 ? 'improving' : 'declining') : 'fluctuating';
        } else {
            trend.volatility = 'low';
            trend.trend = 'stable';
        }
    }
    
    return trend;
}

/**
 * 根据班级平均分变化趋势分析生成优化建议
 * @param {Object} analysis - 趋势分析结果
 * @param {Object} thresholds - 分数线设置
 * @returns {Array} 优化建议数组
 */
function generateAverageTrendSuggestions(analysis, thresholds) {
    const suggestions = [];
    
    // 根据总体趋势提供一般性建议
    if (analysis.overview.trend === 'improving') {
        suggestions.push({
            title: '总体趋势积极',
            type: 'general',
            content: `班级整体呈上升趋势，平均每次考试提升 ${Math.abs(analysis.overview.averageChange)} 分，教学效果良好。建议继续保持现有教学方法，适当增加挑战性内容，激发学生潜力。`
        });
    } else if (analysis.overview.trend === 'declining') {
        suggestions.push({
            title: '注意成绩下滑趋势',
            type: 'warning',
            content: `班级整体呈下降趋势，平均每次考试下降 ${Math.abs(analysis.overview.averageChange)} 分。建议分析下滑原因，可能是难度增加或教学方法需要调整，考虑组织针对性补习和心理疏导。`
        });
    } else if (analysis.overview.trend === 'fluctuating') {
        suggestions.push({
            title: '成绩波动明显',
            type: 'warning',
            content: `班级成绩波动较大，说明教学或学习状态不稳定。建议检查教学内容连贯性，关注学生对不同知识点的掌握情况，调整教学节奏。`
        });
    } else {
        suggestions.push({
            title: '成绩保持稳定',
            type: 'general',
            content: `班级整体成绩保持稳定，变化不明显。建议保持现有教学方法的同时，尝试引入新的激励机制，帮助学生突破瓶颈，实现质的飞跃。`
        });
    }
    
    // 根据波动性提供建议
    if (analysis.overview.volatility === 'high') {
        suggestions.push({
            title: '高波动性应对策略',
            type: 'strategy',
            content: `班级成绩波动较大，说明学习状态不稳定。建议：1) 加强基础知识巩固；2) 定期进行小测验，及时发现问题；3) 关注学生学习心态，避免大起大落。`
        });
    }
    
    // 为表现异常的科目提供具体建议
    analysis.trends.forEach(subjectTrend => {
        // 显著上升的科目
        if (subjectTrend.trend === 'improving' && parseFloat(subjectTrend.totalChange) >= 8) {
            suggestions.push({
                title: `${subjectTrend.subject}科目显著进步`,
                type: 'subject',
                subject: subjectTrend.subject,
                content: `${subjectTrend.subject}科目表现优异，总体提升${subjectTrend.totalChange}分，教学方法值得总结推广。可以组织优秀学生分享学习方法，带动其他学科进步。`
            });
        }
        // 显著下降的科目
        else if (subjectTrend.trend === 'declining' && parseFloat(subjectTrend.totalChange) <= -8) {
            suggestions.push({
                title: `${subjectTrend.subject}科目需要关注`,
                type: 'subject',
                subject: subjectTrend.subject,
                content: `${subjectTrend.subject}科目下滑明显，总体下降${Math.abs(subjectTrend.totalChange)}分。建议分析试卷，找出易错点，针对性加强训练，必要时调整授课方式和内容难度。`
            });
        }
        // 波动很大的科目
        else if (subjectTrend.volatility === 'high') {
            suggestions.push({
                title: `${subjectTrend.subject}科目波动较大`,
                type: 'subject',
                subject: subjectTrend.subject,
                content: `${subjectTrend.subject}科目成绩不稳定，波动较大。建议检查学生对不同知识模块的掌握情况，找出薄弱环节，设计系统性的复习计划，注重知识点的连贯性。`
            });
        }
    });
    
    // 增加针对分数线的建议
    // 如果班级平均分低于良好线
    if (analysis.overview.finalScore < thresholds.goodScore) {
        suggestions.push({
            title: '提升整体水平',
            type: 'strategy',
            content: `班级平均分(${analysis.overview.finalScore})低于良好线(${thresholds.goodScore})，建议加强基础训练，多进行针对性练习，尤其关注学困生，提升整体水平。`
        });
    }
    // 如果班级平均分接近优秀线
    else if (analysis.overview.finalScore >= thresholds.goodScore && analysis.overview.finalScore < thresholds.excellentScore) {
        suggestions.push({
            title: '冲刺优秀水平',
            type: 'strategy',
            content: `班级平均分(${analysis.overview.finalScore})接近优秀线(${thresholds.excellentScore})，可以适当增加难度，帮助学生突破瓶颈，同时因材施教，关注不同层次学生的需求。`
        });
    }
    
    // 通用的教学建议
    suggestions.push({
        title: '教学方法优化',
        type: 'general',
        content: '根据趋势分析，建议：1) 定期回顾知识点，形成知识网络；2) 增加分层练习，满足不同学生需求；3) 建立激励机制，鼓励进步；4) 加强师生沟通，及时调整教学策略。'
    });
    
    return suggestions;
}

/**
 * 渲染班级平均分变化趋势分析总结和建议
 * @param {Object} analysis - 趋势分析结果
 * @param {Array} filesData - 文件数据数组
 * @param {string} selectedSubject - 选择的科目
 * @returns {string} HTML内容
 */
function renderClassAverageTrendSummary(analysis, filesData, selectedSubject) {
    if (!analysis) {
        return `
            <div class="analysis-summary">
                <div class="summary-title">
                    <i class="fas fa-chart-line"></i> 班级平均分变化趋势分析总结
                </div>
                <div class="summary-text">
                    数据不足，无法生成趋势分析。需要至少两次包含相同科目的考试记录。
                </div>
            </div>
        `;
    }
    
    // 获取班级名称
    let className = '';
    if (filesData.length > 0 && filesData[0].className) {
        className = filesData[0].className;
    } else {
        className = '本班';
    }
    
    // 趋势类型的中文描述
    const trendText = {
        'improving': '上升',
        'declining': '下降',
        'stable': '稳定',
        'fluctuating': '波动'
    };
    
    // 波动性的中文描述
    const volatilityText = {
        'low': '低',
        'medium': '中',
        'high': '高'
    };
    
    // 生成总结文本
    let summaryText = '';
    
    if (selectedSubject !== 'all') {
        // 单科目总结
        summaryText = `
            <p>${className}在${selectedSubject}科目上的平均分整体呈<strong>${trendText[analysis.overview.trend]}</strong>趋势。
            从初始平均分${analysis.overview.initialScore}分到最终平均分${analysis.overview.finalScore}分，
            总体变化了${analysis.overview.totalChange}分，平均每次考试变化${analysis.overview.averageChange}分。
            期间最高平均分达到${analysis.overview.maxScore}分，最低平均分为${analysis.overview.minScore}分，
            成绩波动性${volatilityText[analysis.overview.volatility]}。</p>
        `;
    } else {
        // 多科目总结
        const improvingSubjects = analysis.trends.filter(t => t.trend === 'improving').map(t => t.subject);
        const decliningSubjects = analysis.trends.filter(t => t.trend === 'declining').map(t => t.subject);
        const stableSubjects = analysis.trends.filter(t => t.trend === 'stable').map(t => t.subject);
        
        summaryText = `
            <p>${className}的整体平均分呈<strong>${trendText[analysis.overview.trend]}</strong>趋势，
            平均每次考试变化${analysis.overview.averageChange}分，成绩波动性${volatilityText[analysis.overview.volatility]}。</p>
        `;
        
        if (improvingSubjects.length > 0) {
            summaryText += `<p>其中，${improvingSubjects.join('、')}等科目呈上升趋势；</p>`;
        }
        
        if (decliningSubjects.length > 0) {
            summaryText += `<p>${decliningSubjects.join('、')}等科目呈下降趋势；</p>`;
        }
        
        if (stableSubjects.length > 0) {
            summaryText += `<p>${stableSubjects.join('、')}等科目保持稳定。</p>`;
        }
    }
    
    // 生成具体科目的趋势描述
    let subjectTrendsHTML = '';
    
    if (analysis.trends.length > 0) {
        subjectTrendsHTML = `
            <div class="subject-trend-suggestions">
        `;
        
        analysis.trends.forEach(trend => {
            const trendBadgeClass = `trend-${trend.trend === 'improving' ? 'improving' : 
                                    trend.trend === 'declining' ? 'declining' : 
                                    trend.trend === 'stable' ? 'stable' : 'fluctuating'}`;
            
            // 生成该科目的成绩点
            let scorePointsHTML = '';
            for (let i = 0; i < trend.scores.length; i++) {
                scorePointsHTML += `
                    <span class="trend-score-item">
                        <i class="fas fa-clipboard-list"></i>${trend.examNames[i]}: ${trend.scores[i]}
                    </span>
                `;
            }
            
            // 生成该科目的变化点
            let changePointsHTML = '';
            if (trend.changePoints.length > 0) {
                trend.changePoints.forEach(point => {
                    const isPositive = parseFloat(point.change) > 0;
                    changePointsHTML += `
                        <span class="trend-score-item">
                            <i class="fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                            ${point.from}→${point.to}: ${isPositive ? '+' : ''}${point.change}
                        </span>
                    `;
                });
            }
            
            subjectTrendsHTML += `
                <div class="subject-trend-suggestion">
                    <div class="subject-trend-header">
                        <h5>${trend.subject}</h5>
                        <span class="trend-badge ${trendBadgeClass}">
                            ${trendText[trend.trend]}
                        </span>
                    </div>
                    <div class="subject-trend-scores">
                        ${scorePointsHTML}
                    </div>
                    <div class="subject-trend-scores">
                        ${changePointsHTML}
                    </div>
                    <p class="subject-trend-suggestion-text">
                        ${trend.subject}科目从${trend.initialScore}分变化到${trend.finalScore}分，
                        总变化${trend.totalChange}分，平均每次变化${trend.averageChange}分。
                        ${trend.trend === 'improving' ? '呈现良好的上升趋势。' : 
                          trend.trend === 'declining' ? '呈现下降趋势，需要关注。' : 
                          trend.trend === 'stable' ? '保持稳定，可以尝试突破。' : 
                          '波动较大，需要稳定教学质量。'}
                    </p>
                </div>
            `;
        });
        
        subjectTrendsHTML += `
            </div>
        `;
    }
    
    // 生成优化建议
    let suggestionsHTML = '';
    
    if (analysis.suggestions.length > 0) {
        suggestionsHTML = `
            <div class="trend-strategies-section">
                <h4><i class="fas fa-lightbulb"></i> 针对性优化建议</h4>
                <div class="trend-strategies">
        `;
        
        analysis.suggestions.forEach(suggestion => {
            let iconClass = 'fa-chart-line'; // 默认图标
            
            if (suggestion.type === 'warning') {
                iconClass = 'fa-exclamation-triangle';
            } else if (suggestion.type === 'strategy') {
                iconClass = 'fa-tasks';
            } else if (suggestion.type === 'subject') {
                iconClass = 'fa-book';
            }
            
            suggestionsHTML += `
                <div class="trend-strategy-item">
                    <h5><i class="fas ${iconClass}"></i> ${suggestion.title}</h5>
                    <p>${suggestion.content}</p>
                </div>
            `;
        });
        
        suggestionsHTML += `
                </div>
            </div>
        `;
    }
    
    // 组合完整的总结HTML
    return `
        <div class="analysis-summary">
            <div class="summary-title">
                <i class="fas fa-chart-line"></i> 班级平均分变化趋势分析总结
            </div>
            <div class="summary-text">
                ${summaryText}
            </div>
            
            <div class="subject-trend-suggestions-section">
                <h4><i class="fas fa-chart-bar"></i> 各科目趋势详情</h4>
                ${subjectTrendsHTML}
            </div>
            
            ${suggestionsHTML}
        </div>
    `;
} 