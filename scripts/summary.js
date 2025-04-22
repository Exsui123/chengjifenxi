/**
 * 成绩分析系统 - 成绩总结和建议模块
 * 用于生成成绩分析的文字总结和优化建议
 */

/**
 * 为科目生成文字总结和建议
 * @param {string} subject - 科目名称
 * @param {Array} scores - 成绩数组
 * @param {number} maxScore - 最高分
 * @param {number} minScore - 最低分
 * @param {number} avgScore - 平均分
 * @param {number} excellentCount - 优秀人数
 * @param {number} goodCount - 良好人数
 * @param {number} passCount - 及格人数
 * @param {number} failCount - 不及格人数
 * @param {number} totalCount - 总人数
 * @param {number} excellentRate - 优秀率
 * @param {number} goodRate - 良好率
 * @param {number} passRate - 及格率
 * @param {number} failRate - 不及格率
 * @param {number} passScore - 及格分数线
 * @param {number} goodScore - 良好分数线
 * @param {number} excellentScore - 优秀分数线
 * @returns {HTMLElement} 总结和建议容器
 */
function generateSubjectSummary(subject, scores, maxScore, minScore, avgScore, excellentCount, goodCount, passCount, failCount, totalCount, excellentRate, goodRate, passRate, failRate, passScore, goodScore, excellentScore) {
    // 创建总结容器
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'analysis-summary';
    
    // 计算分数差
    const scoreDiff = maxScore - minScore;
    // 计算优良率
    const excellentGoodRate = (excellentCount + goodCount) / totalCount * 100;
    
    // 创建成绩分析总结
    const summaryTitle = document.createElement('h3');
    summaryTitle.className = 'summary-title';
    summaryTitle.innerHTML = `<i class="fas fa-chart-pie"></i> ${subject}成绩分析总结`;
    
    const summaryText = document.createElement('p');
    summaryText.className = 'summary-text';
    summaryText.innerHTML = `
        本次${subject}考试共有${totalCount}名学生参加，最高分为${maxScore.toFixed(1)}分，最低分为${minScore.toFixed(1)}分，平均分为${avgScore.toFixed(1)}分，分数差为${scoreDiff.toFixed(1)}分。
        <br><br>
        优秀率为${excellentRate}%（${excellentCount}人），良好率为${goodRate}%（${goodCount}人），及格率为${passRate}%（${passCount}人），不及格率为${failRate}%（${failCount}人）。
        <br><br>
        ${generateScoreDistributionAnalysis(excellentCount, goodCount, passCount, failCount, excellentRate, passRate, avgScore)}
    `;
    
    // 创建优化建议
    const adviceTitle = document.createElement('h3');
    adviceTitle.className = 'advice-title';
    adviceTitle.innerHTML = `<i class="fas fa-lightbulb"></i> 优化建议`;
    
    const adviceList = document.createElement('ul');
    adviceList.className = 'advice-list';
    
    // 生成建议列表
    const adviceItems = generateAdvice(failCount, failRate, excellentRate, goodRate, passRate, avgScore, excellentGoodRate);
    
    adviceItems.forEach(advice => {
        const adviceItem = document.createElement('li');
        adviceItem.innerHTML = advice;
        adviceList.appendChild(adviceItem);
    });
    
    // 组装总结容器
    summaryContainer.appendChild(summaryTitle);
    summaryContainer.appendChild(summaryText);
    summaryContainer.appendChild(adviceTitle);
    summaryContainer.appendChild(adviceList);
    
    return summaryContainer;
}

/**
 * 生成分数分布分析文字
 */
function generateScoreDistributionAnalysis(excellentCount, goodCount, passCount, failCount, excellentRate, passRate, avgScore) {
    let analysis = '';
    
    // 根据分数分布情况生成分析
    if (excellentRate >= 30) {
        analysis += '从分数分布来看，班级优秀率较高，学生掌握情况良好。';
    } else if (excellentRate <= 10) {
        analysis += '从分数分布来看，班级优秀率较低，需要加强拔高训练。';
    }
    
    if (passRate >= 90) {
        analysis += '班级及格率较高，基础知识掌握较好。';
    } else if (passRate < 80) {
        analysis += '班级及格率较低，需要加强基础知识巩固。';
    }
    
    if (failCount > 0) {
        analysis += `有${failCount}名同学未能及格，需要重点关注。`;
    }
    
    if (avgScore >= 85) {
        analysis += '整体成绩表现优秀，平均分较高。';
    } else if (avgScore < 70) {
        analysis += '整体成绩表现一般，平均分偏低。';
    }
    
    if (analysis === '') {
        analysis = '整体来看，班级成绩分布较为均衡。';
    }
    
    return analysis;
}

/**
 * 生成优化建议列表
 */
function generateAdvice(failCount, failRate, excellentRate, goodRate, passRate, avgScore, excellentGoodRate) {
    const adviceList = [];
    
    // 针对不及格学生的建议
    if (failCount > 0) {
        adviceList.push(`<strong>关注不及格学生</strong>：建议重点关注${failCount}名未及格的同学，分析其薄弱环节，给予针对性辅导，帮助其尽快提升成绩。`);
    }
    
    // 针对及格率的建议
    if (passRate < 85) {
        adviceList.push('<strong>提升整体及格率</strong>：建议加强基础知识的复习和巩固，提高整体及格人数。');
    }
    
    // 针对优秀率的建议
    if (excellentRate < 20) {
        adviceList.push('<strong>提高优秀率</strong>：可适当增加难度训练，强化重点知识点，提高优秀率。');
    } else if (excellentRate >= 30) {
        adviceList.push('<strong>保持优秀水平</strong>：建议继续保持当前教学方法，并可适当增加拓展内容，进一步激发学生潜力。');
    }
    
    // 针对平均分的建议
    if (avgScore < 75) {
        adviceList.push('<strong>提升整体水平</strong>：可通过增加课堂练习、小组讨论等方式，提高整体学习效果。');
    }
    
    // 针对分数分布的建议
    if (excellentGoodRate < 50 && failRate > 15) {
        adviceList.push('<strong>分层教学</strong>：建议对学生进行分层教学，针对不同程度的学生制定不同的教学策略。');
    }
    
    // 如果建议不足3条，添加通用建议
    if (adviceList.length < 3) {
        adviceList.push('<strong>加强知识点梳理</strong>：建议对本次考试的重点、难点进行系统梳理，帮助学生建立知识体系。');
    }
    
    if (adviceList.length < 3) {
        adviceList.push('<strong>提高学习兴趣</strong>：可以通过多样化的教学方式，激发学生学习兴趣，提高学习效果。');
    }
    
    return adviceList;
}

/**
 * 生成个人成绩详情的文字总结和建议
 * @param {Object} studentData - 学生数据
 * @param {Array} subjects - 科目列表
 * @param {Object} classAvgScores - 班级平均分
 * @param {Object} maxScores - 各科目最高分
 * @param {number} totalScore - 学生总分
 * @param {number} avgScore - 学生平均分
 * @param {number} ranking - 学生排名
 * @param {number} totalStudents - 班级总人数
 * @returns {HTMLElement} 总结和建议容器
 */
function generatePersonalDetailSummary(studentData, subjects, classAvgScores, maxScores, totalScore, avgScore, ranking, totalStudents) {
    // 创建总结容器
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'analysis-summary';
    
    // 计算排名百分比
    const rankPercentage = (ranking / totalStudents * 100).toFixed(1);
    
    // 整体表现评价
    let overallPerformance = '';
    if (ranking <= Math.ceil(totalStudents * 0.1)) {
        overallPerformance = '优秀，在班级中处于领先地位';
    } else if (ranking <= Math.ceil(totalStudents * 0.30)) {
        overallPerformance = '良好，位于班级前列';
    } else if (ranking <= Math.ceil(totalStudents * 0.70)) {
        overallPerformance = '中等，接近班级平均水平';
    } else {
        overallPerformance = '需要提升，相对班级还有进步空间';
    }
    
    // 查找强势和弱势科目
    const subjectPerformance = [];
    subjects.forEach(subject => {
        const studentScore = studentData.scores[subject] || 0;
        const classAvg = classAvgScores[subject] || 0;
        const diff = studentScore - classAvg;
        const diffPercentage = (diff / classAvg * 100).toFixed(1);
        
        subjectPerformance.push({
            subject: subject,
            score: studentScore,
            diff: diff,
            diffPercentage: diffPercentage
        });
    });
    
    // 按差异排序，找出强势和弱势科目
    subjectPerformance.sort((a, b) => b.diff - a.diff);
    const strongSubjects = subjectPerformance.filter(s => s.diff > 0);
    const weakSubjects = subjectPerformance.filter(s => s.diff < 0);
    
    // 创建成绩分析总结
    const summaryTitle = document.createElement('h3');
    summaryTitle.className = 'summary-title';
    summaryTitle.innerHTML = `<i class="fas fa-chart-pie"></i> ${studentData.name}的成绩分析总结`;
    
    const summaryText = document.createElement('p');
    summaryText.className = 'summary-text';
    
    // 整体表现文字
    let summaryContent = `${studentData.name}同学的整体学习表现${overallPerformance}。总分${totalScore}分，平均分${avgScore.toFixed(1)}分，在班级中排名第${ranking}名（前${rankPercentage}%）。`;
    
    // 强势科目分析
    if (strongSubjects.length > 0) {
        summaryContent += `<br><br>强势科目：`;
        strongSubjects.forEach((item, index) => {
            if (index > 0) summaryContent += '，';
            summaryContent += `${item.subject}（高于班级平均${item.diff.toFixed(1)}分，超出${item.diffPercentage}%）`;
        });
    }
    
    // 弱势科目分析
    if (weakSubjects.length > 0) {
        summaryContent += `<br><br>有待提高的科目：`;
        weakSubjects.forEach((item, index) => {
            if (index > 0) summaryContent += '，';
            summaryContent += `${item.subject}（低于班级平均${Math.abs(item.diff).toFixed(1)}分，差距${Math.abs(item.diffPercentage)}%）`;
        });
    }
    
    summaryText.innerHTML = summaryContent;
    
    // 创建优化建议
    const adviceTitle = document.createElement('h3');
    adviceTitle.className = 'advice-title';
    adviceTitle.innerHTML = `<i class="fas fa-lightbulb"></i> 学习建议`;
    
    const adviceList = document.createElement('ul');
    adviceList.className = 'advice-list';
    
    // 生成建议列表
    const adviceItems = generatePersonalAdvice(studentData.name, strongSubjects, weakSubjects, ranking, totalStudents);
    
    adviceItems.forEach(advice => {
        const adviceItem = document.createElement('li');
        adviceItem.innerHTML = advice;
        adviceList.appendChild(adviceItem);
    });
    
    // 组装总结容器
    summaryContainer.appendChild(summaryTitle);
    summaryContainer.appendChild(summaryText);
    summaryContainer.appendChild(adviceTitle);
    summaryContainer.appendChild(adviceList);
    
    return summaryContainer;
}

/**
 * 生成个人学习建议列表
 */
function generatePersonalAdvice(studentName, strongSubjects, weakSubjects, ranking, totalStudents) {
    const adviceList = [];
    
    // 针对弱势科目的建议
    if (weakSubjects.length > 0) {
        const weakestSubject = weakSubjects[weakSubjects.length - 1];
        adviceList.push(`<strong>针对${weakestSubject.subject}学科</strong>：建议${studentName}同学加强${weakestSubject.subject}的学习，重点弥补知识点漏洞，可以通过课后习题和辅导提高该科目成绩。`);
    }
    
    // 针对强势科目的建议
    if (strongSubjects.length > 0) {
        const strongestSubject = strongSubjects[0];
        adviceList.push(`<strong>保持${strongestSubject.subject}优势</strong>：建议继续保持${strongestSubject.subject}的学习方法和热情，可以适当增加难度，挑战更高水平的题目。`);
    }
    
    // 针对排名的建议
    if (ranking <= Math.ceil(totalStudents * 0.1)) {
        adviceList.push('<strong>保持领先优势</strong>：建议在保持优秀成绩的同时，培养更广泛的学习兴趣，拓展知识面，为进一步发展奠定基础。');
    } else if (ranking <= Math.ceil(totalStudents * 0.3)) {
        adviceList.push('<strong>冲刺前列</strong>：目前成绩已经很好，建议注意查漏补缺，细化知识点，争取更进一步。');
    } else if (ranking <= Math.ceil(totalStudents * 0.7)) {
        adviceList.push('<strong>稳步提升</strong>：建议制定合理的学习计划，加强基础知识掌握，逐步提高各科成绩。');
    } else {
        adviceList.push('<strong>全面提升</strong>：建议重新调整学习方法和习惯，可以寻求老师的针对性辅导，制定基础知识巩固计划。');
    }
    
    // 针对学习方法的建议
    if (weakSubjects.length > strongSubjects.length) {
        adviceList.push('<strong>优化学习方法</strong>：建议尝试多种学习方法，找到适合自己的学习策略，提高学习效率。');
    } else if (weakSubjects.length > 0 && strongSubjects.length > 0) {
        adviceList.push('<strong>学习方法迁移</strong>：可以尝试将强势科目的学习方法迁移到其他科目，实现全面发展。');
    }
    
    return adviceList;
}

/**
 * 生成成绩总结和优化建议
 * @param {Object} studentData - 学生数据
 * @param {Array} subjects - 科目列表
 * @param {Object} classAvgScores - 班级平均分
 * @param {Object} maxScores - 最高分
 * @param {Array} allStudents - 所有学生数据
 * @param {Object} thresholds - 分数线设置(及格线、良好线、优秀线)
 * @returns {Object} 包含总结和建议的对象
 */
function generateScoreSummary(studentData, subjects, classAvgScores, maxScores, allStudents, thresholds) {
    // 获取总分、平均分和排名信息
    const totalScore = calculateTotalScore(studentData, subjects);
    const avgScore = (totalScore / subjects.length).toFixed(2);
    const ranking = calculateRanking(studentData, allStudents, subjects);
    const totalStudents = allStudents.length;
    const rankPercentage = ((ranking / totalStudents) * 100).toFixed(1);

    // 分析科目优势和劣势
    const strengthsAndWeaknesses = analyzeStrengthsAndWeaknesses(studentData, subjects, classAvgScores);
    
    // 确定学生的总体表现水平
    const overallPerformance = determineOverallPerformance(rankPercentage, strengthsAndWeaknesses);
    
    // 生成科目改进建议
    const subjectSuggestions = generateSubjectSuggestions(
        studentData, 
        subjects, 
        classAvgScores, 
        maxScores, 
        thresholds
    );
    
    // 生成学习策略建议
    const studyStrategies = generateStudyStrategies(strengthsAndWeaknesses, overallPerformance);
    
    // 整合成绩总结
    const summary = {
        overall: generateOverallSummary(studentData.name, totalScore, avgScore, ranking, totalStudents, overallPerformance),
        strengths: strengthsAndWeaknesses.strengths,
        weaknesses: strengthsAndWeaknesses.weaknesses,
        subjectSuggestions: subjectSuggestions,
        studyStrategies: studyStrategies
    };
    
    return summary;
}

/**
 * 分析学生的优势科目和劣势科目
 * @param {Object} studentData - 学生数据
 * @param {Array} subjects - 科目列表
 * @param {Object} classAvgScores - 班级平均分
 * @returns {Object} 优势和劣势科目分析
 */
function analyzeStrengthsAndWeaknesses(studentData, subjects, classAvgScores) {
    const strengths = [];
    const weaknesses = [];
    
    // 计算学生各科目与班级平均分的差距
    const scoreDifferences = {};
    subjects.forEach(subject => {
        const studentScore = studentData.scores[subject] || 0;
        const classAvg = classAvgScores[subject] || 0;
        scoreDifferences[subject] = studentScore - classAvg;
    });
    
    // 按差距排序科目
    const sortedSubjects = [...subjects].sort((a, b) => scoreDifferences[b] - scoreDifferences[a]);
    
    // 前1/3为优势科目
    const strengthCount = Math.ceil(subjects.length / 3);
    for (let i = 0; i < strengthCount && i < sortedSubjects.length; i++) {
        const subject = sortedSubjects[i];
        const diff = scoreDifferences[subject];
        if (diff > 0) { // 只有高于平均分的才算优势
            strengths.push({
                subject: subject,
                score: studentData.scores[subject] || 0,
                diffFromAvg: diff.toFixed(2)
            });
        }
    }
    
    // 后1/3为劣势科目
    const startIdx = Math.max(sortedSubjects.length - strengthCount, 0);
    for (let i = startIdx; i < sortedSubjects.length; i++) {
        const subject = sortedSubjects[i];
        const diff = scoreDifferences[subject];
        if (diff < 0) { // 只有低于平均分的才算劣势
            weaknesses.push({
                subject: subject,
                score: studentData.scores[subject] || 0,
                diffFromAvg: diff.toFixed(2)
            });
        }
    }
    
    return { strengths, weaknesses };
}

/**
 * 确定学生的总体表现水平
 * @param {number} rankPercentage - 排名百分比
 * @param {Object} strengthsAndWeaknesses - 优势和劣势科目
 * @returns {string} 表现水平描述
 */
function determineOverallPerformance(rankPercentage, strengthsAndWeaknesses) {
    // 根据排名百分比确定基础表现
    let performance = '';
    if (rankPercentage <= 10) {
        performance = '优秀';
    } else if (rankPercentage <= 30) {
        performance = '良好';
    } else if (rankPercentage <= 70) {
        performance = '中等';
    } else {
        performance = '需要加强';
    }
    
    // 根据优势和劣势科目数量调整描述
    const { strengths, weaknesses } = strengthsAndWeaknesses;
    
    if (strengths.length > 0 && weaknesses.length === 0) {
        performance += '，各科均衡发展';
    } else if (strengths.length > 0 && weaknesses.length > 0) {
        performance += '，发展不均衡';
    } else if (strengths.length === 0 && weaknesses.length > 0) {
        performance += '，需全面提升';
    }
    
    return performance;
}

/**
 * 生成科目改进建议
 * @param {Object} studentData - 学生数据
 * @param {Array} subjects - 科目列表
 * @param {Object} classAvgScores - 班级平均分
 * @param {Object} maxScores - 最高分
 * @param {Object} thresholds - 分数线设置
 * @returns {Array} 科目建议列表
 */
function generateSubjectSuggestions(studentData, subjects, classAvgScores, maxScores, thresholds) {
    const suggestions = [];
    
    subjects.forEach(subject => {
        const score = studentData.scores[subject] || 0;
        const classAvg = classAvgScores[subject] || 0;
        const maxScore = maxScores[subject] || 0;
        const diffFromAvg = score - classAvg;
        
        let suggestion = '';
        
        // 根据分数与及格线、良好线和优秀线的关系生成建议
        if (score < thresholds.passScore) {
            suggestion = `${subject}成绩未达到及格线，需要进行基础知识查漏补缺，建立学科学习兴趣，制定每日学习计划。`;
        } else if (score < thresholds.goodScore) {
            suggestion = `${subject}成绩已及格但低于良好线，建议巩固基础知识，加强关键概念理解，多做典型习题。`;
        } else if (score < thresholds.excellentScore) {
            suggestion = `${subject}成绩良好，可通过深入学习难点内容和提高解题效率，向优秀水平冲刺。`;
        } else {
            suggestion = `${subject}成绩优秀，建议保持学习状态，可尝试拓展学习和挑战更高难度的题目。`;
        }
        
        // 根据与班级平均分的差距补充建议
        if (diffFromAvg <= -10) {
            suggestion += `与班级平均分差距较大，建议及时找老师进行个别辅导。`;
        } else if (diffFromAvg < 0) {
            suggestion += `略低于班级平均水平，通过小组学习可以有效提高。`;
        } else if (diffFromAvg <= 5) {
            suggestion += `已达到班级平均水平，继续努力可以取得更好成绩。`;
        } else if (diffFromAvg <= 15) {
            suggestion += `超过班级平均水平，可以帮助其他同学，巩固自身知识。`;
        } else {
            suggestion += `大幅超过班级平均水平，可考虑参加学科竞赛拓展能力。`;
        }
        
        // 计算与最高分的差距，补充建议
        const diffFromMax = maxScore - score;
        if (diffFromMax > 20) {
            suggestion += `与最高分尚有较大差距，可分析优秀同学的学习方法。`;
        } else if (diffFromMax > 10) {
            suggestion += `接近班级最高水平，注意查缺补漏可以更进一步。`;
        } else if (diffFromMax > 0) {
            suggestion += `已接近班级最高水平，保持稳定发挥即可。`;
        } else {
            suggestion += `恭喜获得班级最高分，继续保持优秀！`;
        }
        
        suggestions.push({
            subject: subject,
            score: score,
            suggestion: suggestion
        });
    });
    
    return suggestions;
}

/**
 * 生成学习策略建议
 * @param {Object} strengthsAndWeaknesses - 优势和劣势科目
 * @param {string} overallPerformance - 总体表现
 * @returns {Array} 学习策略建议列表
 */
function generateStudyStrategies(strengthsAndWeaknesses, overallPerformance) {
    const strategies = [];
    const { strengths, weaknesses } = strengthsAndWeaknesses;
    
    // 添加时间管理建议
    if (weaknesses.length > 0) {
        strategies.push({
            title: "合理分配学习时间",
            content: `建议根据科目难度调整学习时间分配，对${weaknesses.map(w => w.subject).join('、')}等薄弱科目适当增加学习时间，确保全面发展。`
        });
    }
    
    // 添加学习方法建议
    if (overallPerformance.includes('优秀')) {
        strategies.push({
            title: "保持高效学习方法",
            content: "总结并坚持当前有效的学习方法，可尝试拓展性学习和知识融合，提高综合分析能力。"
        });
    } else if (overallPerformance.includes('良好')) {
        strategies.push({
            title: "优化学习效率",
            content: "建议采用番茄工作法提高专注度，做好课前预习和课后复习，形成良好的学习闭环。"
        });
    } else if (overallPerformance.includes('中等')) {
        strategies.push({
            title: "建立系统学习计划",
            content: "建议制定每周详细学习计划，重视基础知识点的掌握，多做针对性练习，培养解题思路。"
        });
    } else {
        strategies.push({
            title: "基础能力提升",
            content: "建议从基础知识入手，制定每日学习目标，配合错题集管理，逐步建立学科自信心。"
        });
    }
    
    // 添加学习资源建议
    strategies.push({
        title: "利用优质学习资源",
        content: "推荐使用线上学习平台辅助学习，参与小组讨论交流解题思路，必要时寻求老师个别辅导。"
    });
    
    // 添加心态建议
    strategies.push({
        title: "保持积极学习心态",
        content: "学习过程中保持积极心态，适当放松减压，将目标分解为小目标，及时给自己正面鼓励。"
    });
    
    return strategies;
}

/**
 * 生成总体成绩总结
 * @param {string} name - 学生姓名
 * @param {number} totalScore - 总分
 * @param {number} avgScore - 平均分
 * @param {number} ranking - 排名
 * @param {number} totalStudents - 总学生数
 * @param {string} performance - 表现水平
 * @returns {string} 总体总结
 */
function generateOverallSummary(name, totalScore, avgScore, ranking, totalStudents, performance) {
    const rankPercentage = ((ranking / totalStudents) * 100).toFixed(1);
    
    return `${name}同学的总成绩为${totalScore}分，平均分${avgScore}分，在班级${totalStudents}名同学中排名第${ranking}位，处于前${rankPercentage}%，总体表现${performance}。`;
}

/**
 * 渲染成绩总结和建议
 * @param {Object} summary - 成绩总结对象
 * @returns {string} HTML内容
 */
function renderScoreSummary(summary) {
    // 生成优势科目列表HTML
    let strengthsHtml = '';
    if (summary.strengths.length > 0) {
        strengthsHtml = summary.strengths.map(item => 
            `<li>${item.subject}（${item.score}分，高出平均分${item.diffFromAvg}分）</li>`
        ).join('');
    } else {
        strengthsHtml = '<li>暂无明显优势科目，建议全面提升学习能力</li>';
    }
    
    // 生成劣势科目列表HTML
    let weaknessesHtml = '';
    if (summary.weaknesses.length > 0) {
        weaknessesHtml = summary.weaknesses.map(item => 
            `<li>${item.subject}（${item.score}分，低于平均分${Math.abs(item.diffFromAvg)}分）</li>`
        ).join('');
    } else {
        weaknessesHtml = '<li>没有明显的劣势科目，各科发展均衡</li>';
    }
    
    // 生成科目建议HTML
    const subjectSuggestionsHtml = summary.subjectSuggestions.map(item => 
        `<div class="subject-suggestion">
            <h5>${item.subject}（${item.score}分）</h5>
            <p>${item.suggestion}</p>
        </div>`
    ).join('');
    
    // 生成学习策略HTML
    const studyStrategiesHtml = summary.studyStrategies.map(item => 
        `<div class="strategy-item">
            <h5><i class="fas fa-lightbulb"></i> ${item.title}</h5>
            <p>${item.content}</p>
        </div>`
    ).join('');
    
    // 拼接完整HTML
    return `
        <div class="score-summary-section">
            <div class="summary-header">
                <h4><i class="fas fa-chart-line"></i> 成绩总结分析</h4>
            </div>
            <div class="overall-summary">
                <p>${summary.overall}</p>
            </div>
            <div class="summary-details">
                <div class="summary-column">
                    <div class="summary-card strengths-card">
                        <h4><i class="fas fa-star"></i> 优势科目</h4>
                        <ul class="strengths-list">
                            ${strengthsHtml}
                        </ul>
                    </div>
                    <div class="summary-card weaknesses-card">
                        <h4><i class="fas fa-exclamation-triangle"></i> 需加强科目</h4>
                        <ul class="weaknesses-list">
                            ${weaknessesHtml}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="subject-suggestions-section">
                <h4><i class="fas fa-chalkboard-teacher"></i> 科目具体建议</h4>
                <div class="subject-suggestions">
                    ${subjectSuggestionsHtml}
                </div>
            </div>
            
            <div class="study-strategies-section">
                <h4><i class="fas fa-brain"></i> 学习策略建议</h4>
                <div class="study-strategies">
                    ${studyStrategiesHtml}
                </div>
            </div>
        </div>
    `;
}

// 导出模块函数
window.ScoreSummary = {
    generateScoreSummary,
    renderScoreSummary
}; 