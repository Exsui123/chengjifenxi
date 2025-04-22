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