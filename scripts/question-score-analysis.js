/**
 * 成绩分析系统 - 个人小题得分情况分析模块
 * 负责分析和可视化学生的小题得分情况
 */

// 当前选择的文件ID
let selectedQuestionScoreFileId = '';
// 当前选择的学生ID
let selectedQuestionScoreStudentId = '';

// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    initQuestionScoreAnalysisModule();
});

/**
 * 初始化个人小题得分情况分析模块
 */
function initQuestionScoreAnalysisModule() {
    // 获取文件选择下拉框
    const fileSelect = document.getElementById('questionScoreFileSelect');
    // 获取学生选择下拉框
    const studentSelect = document.getElementById('questionScoreStudentSelect');
    // 获取生成分析按钮
    const generateBtn = document.getElementById('generateQuestionScoreBtn');
    
    // 如果元素不存在，表示不在分析页面，直接返回
    if (!fileSelect || !studentSelect || !generateBtn) return;
    
    // 文件选择变化事件
    fileSelect.addEventListener('change', function() {
        selectedQuestionScoreFileId = this.value;
        
        if (selectedQuestionScoreFileId) {
            // 显示已选择文件信息
            updateQuestionScoreSelectedFileInfo();
            // 加载学生选择下拉框
            loadQuestionScoreStudentOptions();
            // 启用学生选择下拉框
            studentSelect.disabled = false;
        } else {
            // 隐藏已选择文件信息
            document.getElementById('questionScoreSelectedFileInfo').style.display = 'none';
            // 清空并禁用学生选择下拉框
            studentSelect.innerHTML = '<option value="">-- 请先选择成绩表 --</option>';
            studentSelect.disabled = true;
            // 禁用生成按钮
            generateBtn.disabled = true;
        }
    });
    
    // 学生选择变化事件
    studentSelect.addEventListener('change', function() {
        selectedQuestionScoreStudentId = this.value;
        updateGenerateQuestionScoreButtonState();
    });
    
    // 生成按钮点击事件
    generateBtn.addEventListener('click', function() {
        if (selectedQuestionScoreFileId && selectedQuestionScoreStudentId) {
            performQuestionScoreAnalysis();
        }
    });
}

/**
 * 显示个人小题得分情况分析选项
 */
function showQuestionScoreAnalysisOptions() {
    console.log('显示个人小题得分情况分析选项...');
    
    // 显示选项区域
    const optionsArea = document.getElementById('questionScoreAnalysisOptions');
    if (optionsArea) {
        console.log('找到选项区域，设置为显示');
        optionsArea.style.display = 'block';
    } else {
        console.error('未找到选项区域 questionScoreAnalysisOptions');
    }
    
    // 加载文件选择下拉框选项
    loadQuestionScoreFileOptions();
}

/**
 * 隐藏个人小题得分情况分析选项
 */
function hideQuestionScoreAnalysisOptions() {
    // 隐藏选项区域
    const optionsArea = document.getElementById('questionScoreAnalysisOptions');
    if (optionsArea) {
        optionsArea.style.display = 'none';
    }
}

/**
 * 加载文件选择下拉框选项
 */
function loadQuestionScoreFileOptions() {
    const fileSelect = document.getElementById('questionScoreFileSelect');
    if (!fileSelect) {
        console.error('找不到文件选择下拉框 questionScoreFileSelect');
        return;
    }
    
    console.log('开始加载成绩表选项...');
    
    // 清空下拉框
    fileSelect.innerHTML = '<option value="">-- 请选择成绩表 --</option>';
    
    // 获取所有文件数据
    const filesData = JSON.parse(localStorage.getItem('scoreFiles')) || [];
    console.log('从localStorage加载到的成绩表数量:', filesData.length);
    
    // 添加文件选项
    if (filesData.length === 0) {
        console.warn('没有找到成绩表数据');
        fileSelect.innerHTML += '<option value="" disabled>没有找到成绩表数据</option>';
    } else {
        filesData.forEach(file => {
            const option = document.createElement('option');
            option.value = file.id;
            option.textContent = `${file.name || '未命名'} - ${file.class || '未知班级'} (${file.date || '无日期'})`;
            fileSelect.appendChild(option);
            console.log('添加选项:', file.id, option.textContent);
        });
    }
    
    console.log('成绩表选项加载完成');
}

/**
 * 更新已选择文件信息
 */
function updateQuestionScoreSelectedFileInfo() {
    const infoContainer = document.getElementById('questionScoreSelectedFileInfo');
    const fileDetailContainer = document.getElementById('questionScoreSelectedFileDetail');
    
    if (!infoContainer || !fileDetailContainer || !selectedQuestionScoreFileId) return;
    
    // 获取文件数据
    const filesData = JSON.parse(localStorage.getItem('scoreFiles')) || [];
    const fileData = filesData.find(file => file.id === selectedQuestionScoreFileId);
    
    if (fileData) {
        // 构造文件信息HTML
        const html = `
            <p><strong>名称:</strong> ${fileData.name}</p>
            <p><strong>班级:</strong> ${fileData.class}</p>
            <p><strong>日期:</strong> ${fileData.date}</p>
        `;
        
        // 更新文件信息
        fileDetailContainer.innerHTML = html;
        infoContainer.style.display = 'block';
    } else {
        infoContainer.style.display = 'none';
    }
}

/**
 * 加载学生选择下拉框选项
 */
function loadQuestionScoreStudentOptions() {
    const studentSelect = document.getElementById('questionScoreStudentSelect');
    if (!studentSelect || !selectedQuestionScoreFileId) return;
    
    // 清空下拉框
    studentSelect.innerHTML = '<option value="">-- 请选择学生 --</option>';
    
    // 获取文件数据
    const filesData = JSON.parse(localStorage.getItem('scoreFiles')) || [];
    const fileData = filesData.find(file => file.id === selectedQuestionScoreFileId);
    
    if (fileData && fileData.data && fileData.data.length > 1) {
        // 查找学号和姓名列的索引
        const headers = fileData.data[0];
        const idColumnIndex = findStudentIdColumnIndex(headers);
        const nameColumnIndex = findStudentNameColumnIndex(headers);
        
        if (idColumnIndex !== -1 && nameColumnIndex !== -1) {
            // 提取学生数据
            const students = fileData.data.slice(1).map(row => ({
                id: row[idColumnIndex],
                name: row[nameColumnIndex]
            }));
            
            // 添加学生选项
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.name} (${student.id})`;
                studentSelect.appendChild(option);
            });
        }
    }
}

/**
 * 更新生成按钮状态
 */
function updateGenerateQuestionScoreButtonState() {
    const generateBtn = document.getElementById('generateQuestionScoreBtn');
    if (!generateBtn) return;
    
    // 如果已选择文件和学生，启用生成按钮
    generateBtn.disabled = !(selectedQuestionScoreFileId && selectedQuestionScoreStudentId);
}

/**
 * 执行个人小题得分情况分析
 */
function performQuestionScoreAnalysis() {
    // 获取文件数据
    const filesData = JSON.parse(localStorage.getItem('scoreFiles')) || [];
    const fileData = filesData.find(file => file.id === selectedQuestionScoreFileId);
    
    if (!fileData) return;
    
    // 清空分析结果区域
    clearAnalysisResult();
    
    // 查找学号和姓名列的索引
    const headers = fileData.data[0];
    const idColumnIndex = findStudentIdColumnIndex(headers);
    const nameColumnIndex = findStudentNameColumnIndex(headers);
    
    if (idColumnIndex === -1 || nameColumnIndex === -1) {
        showMessage('无法识别学号或姓名列', 'error');
        return;
    }
    
    // 查找小题分数列
    const questionColumns = findQuestionScoreColumns(headers);
    
    if (questionColumns.length === 0) {
        showMessage('未找到小题分数列，请确保成绩表中包含类似"小题1"、"题1"等列名', 'error');
        return;
    }
    
    // 查找学生数据
    const studentRow = fileData.data.slice(1).find(row => row[idColumnIndex] === selectedQuestionScoreStudentId);
    
    if (!studentRow) {
        showMessage('未找到所选学生的数据', 'error');
        return;
    }
    
    // 生成个人小题得分情况分析结果
    generateQuestionScoreAnalysisResult(studentRow, headers, questionColumns, nameColumnIndex);
}

/**
 * 查找小题分数列
 * @param {Array} headers - 表头行
 * @returns {Array} 小题分数列的索引和列名数组
 */
function findQuestionScoreColumns(headers) {
    const questionColumns = [];
    
    // 查找包含"小题"、"题"等关键词的列
    headers.forEach((header, index) => {
        if (
            (typeof header === 'string' && (
                header.includes('小题') || 
                header.includes('题') || 
                /Q\d+/.test(header) || // 匹配Q1, Q2等格式
                /第\s*\d+\s*题/.test(header) || // 匹配"第1题"、"第 1 题"等格式
                /题目\s*\d+/.test(header) // 匹配"题目1"、"题目 1"等格式
            )) ||
            (typeof header === 'number' && index > 2) // 如果是纯数字且不是学号或姓名列，也可能是题号
        ) {
            questionColumns.push({
                index: index,
                name: header
            });
        }
    });
    
    // 如果没有找到明确的小题列，尝试使用除了学号、姓名和总分外的所有其他列
    if (questionColumns.length === 0) {
        // 查找可能的总分列
        const totalScoreIndex = headers.findIndex(header => 
            typeof header === 'string' && (
                header.includes('总分') || 
                header.includes('总成绩') || 
                header.includes('成绩') || 
                header === '分数'
            )
        );
        
        // 获取学号和姓名列的索引
        const idIndex = findStudentIdColumnIndex(headers);
        const nameIndex = findStudentNameColumnIndex(headers);
        
        // 除了学号、姓名和总分外的所有列都可能是小题列
        headers.forEach((header, index) => {
            if (
                index !== idIndex && 
                index !== nameIndex && 
                index !== totalScoreIndex &&
                index > 1 // 跳过可能的序号列
            ) {
                questionColumns.push({
                    index: index,
                    name: header
                });
            }
        });
    }
    
    // 按照题目序号排序（假设题目名称中包含数字）
    return questionColumns.sort((a, b) => {
        const numA = parseInt(String(a.name).replace(/[^0-9]/g, '')) || 0;
        const numB = parseInt(String(b.name).replace(/[^0-9]/g, '')) || 0;
        return numA - numB;
    });
}

/**
 * 生成个人小题得分情况分析结果
 * @param {Array} studentRow - 学生数据行
 * @param {Array} headers - 表头行
 * @param {Array} questionColumns - 小题分数列的信息
 * @param {number} nameColumnIndex - 姓名列的索引
 */
function generateQuestionScoreAnalysisResult(studentRow, headers, questionColumns, nameColumnIndex) {
    // 获取分析结果容器
    const resultContainer = document.getElementById('analysisResult');
    if (!resultContainer) return;
    
    // 获取学生姓名
    const studentName = studentRow[nameColumnIndex];
    
    // 创建分析结果内容
    const resultHTML = `
        <div class="analysis-result-container">
            <h3 class="analysis-title">个人小题得分情况分析 - ${studentName}</h3>
            <div class="analysis-content">
                <div class="question-score-chart-container">
                    <canvas id="questionScoreChart"></canvas>
                </div>
                <div class="question-score-summary">
                    <h4>得分情况概述</h4>
                    <div id="questionScoreSummary"></div>
                </div>
            </div>
        </div>
    `;
    
    // 更新分析结果容器
    resultContainer.innerHTML = resultHTML;
    
    // 收集小题分数数据
    const questionScores = questionColumns.map(column => {
        const score = parseFloat(studentRow[column.index]) || 0;
        
        // 尝试从其他行获取各小题的满分值
        const maxScore = getQuestionMaxScore(column.index);
        
        return {
            question: column.name,
            score: score,
            maxScore: maxScore
        };
    });
    
    // 渲染小题得分图表
    renderQuestionScoreChart(questionScores);
    
    // 生成得分概述
    generateQuestionScoreSummary(questionScores);
    
    /**
     * 获取小题的满分值（如果有的话）
     * @param {number} columnIndex - 列索引
     * @returns {number} 满分值，如果不确定则返回0
     */
    function getQuestionMaxScore(columnIndex) {
        // 这里可以实现获取满分的逻辑，例如从文件备注中查找
        // 目前简单返回一个假设的满分值
        return 10; // 假设每小题满分10分
    }
}

/**
 * 渲染小题得分图表
 * @param {Array} questionScores - 小题分数数据
 */
function renderQuestionScoreChart(questionScores) {
    const canvas = document.getElementById('questionScoreChart');
    if (!canvas) return;
    
    // 准备图表数据
    const labels = questionScores.map(item => item.question);
    const scores = questionScores.map(item => item.score);
    const maxScores = questionScores.map(item => item.maxScore);
    
    // 计算得分率
    const scoreRates = questionScores.map(item => 
        item.maxScore > 0 ? (item.score / item.maxScore * 100).toFixed(1) + '%' : 'N/A'
    );
    
    // 创建水平条形图
    const chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '得分',
                data: scores,
                backgroundColor: questionScores.map(item => {
                    const rate = item.maxScore > 0 ? item.score / item.maxScore : 0;
                    if (rate >= 0.8) return 'rgba(75, 192, 192, 0.7)'; // 得分率高
                    if (rate >= 0.6) return 'rgba(54, 162, 235, 0.7)'; // 得分率中等
                    return 'rgba(255, 99, 132, 0.7)'; // 得分率低
                }),
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1
            }, {
                label: '满分',
                data: maxScores,
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // 水平条形图
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '分数',
                        font: {
                            size: 14
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '题目',
                        font: {
                            size: 14
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            if (context.datasetIndex === 0) { // 只在显示得分的数据集中显示得分率
                                return `得分率: ${scoreRates[index]}`;
                            }
                            return '';
                        }
                    }
                },
                datalabels: {
                    display: function(context) {
                        return context.datasetIndex === 0; // 只在得分的数据集上显示标签
                    },
                    formatter: function(value, context) {
                        const index = context.dataIndex;
                        return value + ' (' + scoreRates[index] + ')';
                    },
                    color: 'black',
                    anchor: 'end',
                    align: 'end',
                    offset: 4,
                    font: {
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: '个人小题得分情况',
                    font: {
                        size: 18
                    }
                }
            }
        }
    });
    
    // 调整图表容器高度
    const container = document.querySelector('.question-score-chart-container');
    if (container) {
        // 根据题目数量调整高度，每题至少40px高度
        const minHeight = Math.max(400, questionScores.length * 40);
        container.style.height = minHeight + 'px';
    }
}

/**
 * 生成小题得分概述
 * @param {Array} questionScores - 小题分数数据
 */
function generateQuestionScoreSummary(questionScores) {
    const summaryContainer = document.getElementById('questionScoreSummary');
    if (!summaryContainer) return;
    
    // 计算总分和总满分
    const totalScore = questionScores.reduce((sum, item) => sum + item.score, 0);
    const totalMaxScore = questionScores.reduce((sum, item) => sum + item.maxScore, 0);
    const totalScoreRate = totalMaxScore > 0 ? (totalScore / totalMaxScore * 100).toFixed(1) + '%' : 'N/A';
    
    // 找出得分率最高和最低的题目
    const sortedByRate = [...questionScores].filter(item => item.maxScore > 0)
        .sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore));
    
    const bestQuestions = sortedByRate.slice(0, 3);
    const worstQuestions = sortedByRate.slice(-3).reverse();
    
    // 创建概述HTML
    let summaryHTML = `
        <div class="score-summary-card">
            <div class="summary-total">
                <p><strong>总得分：</strong>${totalScore}/${totalMaxScore} (${totalScoreRate})</p>
            </div>
            <div class="summary-strength">
                <h5>掌握较好的题目：</h5>
                <ul>
    `;
    
    // 添加最高得分率题目
    bestQuestions.forEach(item => {
        const rate = (item.score / item.maxScore * 100).toFixed(1);
        summaryHTML += `<li>${item.question}：${item.score}/${item.maxScore} (${rate}%)</li>`;
    });
    
    summaryHTML += `
                </ul>
            </div>
            <div class="summary-weakness">
                <h5>需要加强的题目：</h5>
                <ul>
    `;
    
    // 添加最低得分率题目
    worstQuestions.forEach(item => {
        const rate = (item.score / item.maxScore * 100).toFixed(1);
        summaryHTML += `<li>${item.question}：${item.score}/${item.maxScore} (${rate}%)</li>`;
    });
    
    summaryHTML += `
                </ul>
            </div>
            <div class="summary-suggestion">
                <h5>学习建议：</h5>
                <p>建议重点复习得分率较低的题目类型，特别关注以下题型：${worstQuestions.map(item => item.question).join('、')}。</p>
                <p>对于掌握较好的题目类型（${bestQuestions.map(item => item.question).join('、')}），建议保持现有学习方法，并尝试更具挑战性的题目。</p>
            </div>
        </div>
    `;
    
    // 更新概述容器
    summaryContainer.innerHTML = summaryHTML;
}

/**
 * 查找学生ID列的索引
 * @param {Array} headers - 表头行
 * @returns {number} 学生ID列的索引，如果未找到则返回-1
 */
function findStudentIdColumnIndex(headers) {
    return headers.findIndex(header => 
        typeof header === 'string' && (
            header.trim().toLowerCase() === '学号' || 
            header.trim().toLowerCase() === 'id' || 
            header.trim().toLowerCase() === '序号' || 
            header.trim().toLowerCase() === 'no' ||
            header.trim().toLowerCase() === 'no.'
        )
    );
}

/**
 * 查找学生姓名列的索引
 * @param {Array} headers - 表头行
 * @returns {number} 学生姓名列的索引，如果未找到则返回-1
 */
function findStudentNameColumnIndex(headers) {
    return headers.findIndex(header => 
        typeof header === 'string' && (
            header.trim().toLowerCase() === '姓名' || 
            header.trim().toLowerCase() === 'name' ||
            header.trim().toLowerCase() === '名字'
        )
    );
}

// 将关键函数暴露给全局环境，确保其他模块可以调用
window.showQuestionScoreAnalysisOptions = showQuestionScoreAnalysisOptions;
window.hideQuestionScoreAnalysisOptions = hideQuestionScoreAnalysisOptions;
window.loadQuestionScoreFileOptions = loadQuestionScoreFileOptions;
window.performQuestionScoreAnalysis = performQuestionScoreAnalysis;

// 在控制台输出信息，确认模块已加载
console.log('个人小题得分情况分析模块已加载'); 