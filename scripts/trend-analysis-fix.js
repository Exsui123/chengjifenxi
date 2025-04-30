/**
 * 成绩分析系统 - 趋势分析修复脚本
 * 用于修复"个人成绩变化趋势图"中无法显示物理、化学等科目的问题
 */

// 在DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 添加修复函数到页面加载事件
    fixTrendAnalysisAllSubjectsDisplay();
    
    console.log('趋势分析修复脚本已加载');
});

/**
 * 修复趋势分析中全部科目的显示问题
 */
function fixTrendAnalysisAllSubjectsDisplay() {
    console.log('开始修复趋势分析全部科目显示问题...');
    
    // 监听生成趋势图按钮的点击事件
    const generateTrendBtn = document.getElementById('generateTrendBtn');
    if (generateTrendBtn) {
        console.log('已找到生成趋势图按钮，准备添加修复钩子');
        
        // 保存原始的generateTrendChart函数
        if (typeof window.originalGenerateTrendChart === 'undefined' && typeof window.generateTrendChart === 'function') {
            window.originalGenerateTrendChart = window.generateTrendChart;
            console.log('已保存原始的generateTrendChart函数');
            
            // 重写generateTrendChart函数
            window.generateTrendChart = function(student, filesData) {
                console.log('调用修复后的generateTrendChart函数');
                
                // 查找学生姓名列
                const studentNameColumn = findStudentNameColumn(filesData);
                console.log(`学生姓名列索引: ${studentNameColumn}`);
                
                if (filesData.length === 0 || !filesData[0].data || !filesData[0].data[0]) {
                    console.error('文件数据无效或为空');
                    return;
                }
                
                // 获取所有科目列
                const subjectColumns = getSubjectColumns(filesData[0].data[0]);
                console.log('可用科目列:', subjectColumns.map(col => `${col.name}(${col.index})`).join(', '));
                
                // 收集学生在不同文件中的成绩数据
                const scoreData = collectScoreData(student, filesData, studentNameColumn, subjectColumns);
                
                // 调用原始函数的其余部分进行图表渲染
                renderTrendChart(student, filesData, scoreData, subjectColumns);
            };
            
            console.log('已重写generateTrendChart函数');
        } else {
            console.warn('无法找到原始的generateTrendChart函数，或者已经被修复');
        }
    } else {
        console.warn('未找到生成趋势图按钮，无法添加修复钩子');
    }
}

/**
 * 收集学生成绩数据，修复版本
 */
function collectScoreData(student, filesData, studentNameColumn, subjectColumns) {
    console.log('开始收集成绩数据(修复版)...');
    const scoreData = [];
    
    // 获取选中的科目
    const subjectSelect = document.getElementById('subjectSelect');
    const selectedSubject = subjectSelect ? subjectSelect.value : '';
    console.log(`当前选中的科目: ${selectedSubject}`);
    
    // 过滤出包含该学生数据的文件
    const relevantFiles = filesData.filter(file => student.fileIds.includes(file.id));
    console.log(`相关文件数量: ${relevantFiles.length}`);
    
    relevantFiles.forEach(fileData => {
        console.log(`处理文件: ${fileData.name}, ID: ${fileData.id}`);
        
        // 查找该学生在当前文件中的行
        let studentRow = null;
        
        if (fileData.data && fileData.data.length > 1) {
            for (let i = 1; i < fileData.data.length; i++) {
                const row = fileData.data[i];
                if (row && row.length > studentNameColumn && 
                    String(row[studentNameColumn]).trim() === student.name.trim()) {
                    studentRow = row;
                    console.log(`在文件 ${fileData.name} 的第 ${i} 行找到学生 ${student.name}`);
                    break;
                }
            }
        }
        
        // 如果没找到学生行，跳过这个文件
        if (!studentRow) {
            console.warn(`在文件 ${fileData.name} 中未找到学生 ${student.name} 的行`);
            return; // 在forEach中相当于continue，跳过当前循环
        }
        
        // 获取该学生的成绩
        console.log(`学生行数据长度: ${studentRow.length}`);
        
        const fileScores = { 
            fileName: fileData.name || '未命名文件',
            date: fileData.date || null,
            scores: {}
        };
        
        if (selectedSubject === 'all') {
            // 如果选择了全部科目，收集所有科目的成绩
            console.log('全部科目模式 - 收集所有科目成绩');
            
            subjectColumns.forEach(column => {
                if (studentRow.length > column.index) {
                    // 获取原始值
                    const rawValue = studentRow[column.index];
                    
                    // 使用更健壮的数字解析方式
                    let score;
                    if (typeof rawValue === 'number') {
                        // 如果已经是数字类型，直接使用
                        score = rawValue;
                    } else {
                        // 否则尝试解析为数字
                        try {
                            score = parseFloat(String(rawValue).trim());
                        } catch (e) {
                            console.warn(`解析科目 ${column.name} 的成绩时出错:`, e);
                            score = NaN;
                        }
                    }
                    
                    if (!isNaN(score)) {
                        fileScores.scores[column.name] = score;
                        console.log(`科目 ${column.name} 获取到成绩: ${score}`);
                    } else {
                        console.log(`科目 ${column.name} 无法获取有效成绩, 原始值: [${rawValue}], 类型: ${typeof rawValue}`);
                    }
                } else {
                    console.log(`科目 ${column.name} 列索引(${column.index})超出行长度(${studentRow.length})`);
                }
            });
        } else {
            // 收集特定科目的成绩
            console.log(`单科目模式 - 收集科目 ${selectedSubject} 的成绩`);
            
            const subjectColumn = subjectColumns.find(column => column.name === selectedSubject);
            if (subjectColumn && studentRow.length > subjectColumn.index) {
                const rawValue = studentRow[subjectColumn.index];
                // 使用更健壮的数字解析方式
                let score;
                
                if (typeof rawValue === 'number') {
                    score = rawValue;
                } else {
                    try {
                        score = parseFloat(String(rawValue).trim());
                    } catch (e) {
                        console.warn(`解析科目 ${selectedSubject} 的成绩时出错:`, e);
                        score = NaN;
                    }
                }
                
                if (!isNaN(score)) {
                    fileScores.scores[selectedSubject] = score;
                    console.log(`科目 ${selectedSubject} 获取到成绩: ${score}`);
                } else {
                    console.warn(`科目 ${selectedSubject} 无法获取有效成绩, 原始值: [${rawValue}]`);
                }
            } else {
                console.warn(`未找到科目 ${selectedSubject} 的成绩数据`);
            }
        }
        
        scoreData.push(fileScores);
    });
    
    console.log('成绩数据收集完成:', scoreData);
    return scoreData;
}

/**
 * 渲染趋势图，修复版本
 */
function renderTrendChart(student, filesData, scoreData, subjectColumns) {
    console.log('开始渲染趋势图(修复版)...');
    
    // 获取选中的科目
    const subjectSelect = document.getElementById('subjectSelect');
    const selectedSubject = subjectSelect ? subjectSelect.value : '';
    
    // 如果没有收集到数据，显示提示信息
    if (scoreData.length === 0) {
        const analysisResult = document.getElementById('analysisResult');
        if (analysisResult) {
            analysisResult.innerHTML = `
                <div class="analysis-info">
                    <h3>个人成绩变化趋势分析</h3>
                    <p>未找到该学生在选定科目的成绩数据，请选择其他科目或学生</p>
                </div>
            `;
        }
        return;
    }
    
    // 开始绘制图表
    const ctx = document.getElementById('trendChart');
    if (!ctx) {
        console.error('未找到图表画布元素');
        return;
    }
    
    // 如果已经存在图表，销毁它
    try {
        if (window.trendChart instanceof Chart) {
            console.log('销毁旧图表');
            window.trendChart.destroy();
        }
    } catch (error) {
        console.error('销毁旧图表时出错:', error);
    }
    
    // 准备图表数据
    const labels = scoreData.map(data => data.fileName);
    const datasets = [];
    
    // 马卡龙色系的颜色
    const colors = [
        'rgba(255, 159, 64, 1)',    // 橙色
        'rgba(75, 192, 192, 1)',    // 蓝绿色
        'rgba(255, 99, 132, 1)',    // 粉红色
        'rgba(54, 162, 235, 1)',    // 蓝色
        'rgba(153, 102, 255, 1)',   // 紫色
        'rgba(255, 205, 86, 1)',    // 黄色
        'rgba(201, 203, 207, 1)',   // 灰色
        'rgba(255, 127, 80, 1)',    // 珊瑚色
        'rgba(100, 149, 237, 1)',   // 矢车菊蓝
        'rgba(189, 252, 201, 1)',   // 薄荷色
        'rgba(46, 139, 87, 1)',     // 海绿色
        'rgba(210, 105, 30, 1)',    // 巧克力色
        'rgba(220, 20, 60, 1)',     // 猩红色
        'rgba(0, 128, 128, 1)',     // 蓝绿色
        'rgba(128, 0, 128, 1)'      // 紫色
    ];
    
    if (selectedSubject === 'all') {
        // 如果选择了全部科目，为每个科目创建一个数据集
        console.log('全部科目模式 - 准备创建所有科目的数据集');
        // 获取所有可能的科目名称
        const allSubjects = new Set();
        
        // 从科目列和收集到的成绩中获取所有科目名称
        subjectColumns.forEach(column => allSubjects.add(column.name));
        scoreData.forEach(fileScore => {
            Object.keys(fileScore.scores).forEach(subject => allSubjects.add(subject));
        });
        
        console.log('发现的所有科目:', Array.from(allSubjects).join(', '));
        
        // 为每个科目创建数据集
        Array.from(allSubjects).forEach((subject, index) => {
            const data = scoreData.map(fileScore => fileScore.scores[subject] || null);
            
            // 如果所有成绩都是null，跳过这个科目
            if (data.every(score => score === null)) {
                console.log(`科目 ${subject} 所有成绩都为空，跳过`);
                return;
            }
            
            console.log(`添加科目 ${subject} 的数据集:`, data.filter(score => score !== null).length, '个有效成绩点');
            datasets.push({
                label: subject,
                data: data,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length].replace('1)', '0.2)'),
                fill: false,
                tension: 0.1,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'white',
                pointBorderColor: colors[index % colors.length],
                pointBorderWidth: 2
            });
        });
    } else {
        // 只显示选定科目
        console.log(`单科目模式 - 准备创建科目 ${selectedSubject} 的数据集`);
        const data = scoreData.map(fileScore => fileScore.scores[selectedSubject] || null);
        
        console.log(`科目 ${selectedSubject} 的数据:`, data.filter(score => score !== null).length, '个有效成绩点');
        datasets.push({
            label: selectedSubject,
            data: data,
            borderColor: colors[0],
            backgroundColor: colors[0].replace('1)', '0.2)'),
            fill: false,
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'white',
            pointBorderColor: colors[0],
            pointBorderWidth: 2
        });
    }
    
    // 如果没有有效的数据集，显示提示信息
    if (datasets.length === 0) {
        console.warn('没有有效的数据集');
        const analysisResult = document.getElementById('analysisResult');
        if (analysisResult) {
            analysisResult.innerHTML = `
                <div class="analysis-info">
                    <h3>个人成绩变化趋势分析</h3>
                    <p>未找到该学生在选定科目的有效成绩数据，请选择其他科目或学生</p>
                </div>
            `;
        }
        return;
    }
    
    console.log('创建图表，数据集数量:', datasets.length);
    
    try {
        // 创建图表
        window.trendChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${student.name} - 成绩变化趋势图`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    datalabels: {
                        display: function(context) {
                            return context.dataset.data[context.dataIndex] !== null;
                        },
                        backgroundColor: function(context) {
                            return context.dataset.borderColor;
                        },
                        borderRadius: 4,
                        color: 'white',
                        font: {
                            weight: 'bold'
                        },
                        padding: 4,
                        formatter: function(value) {
                            return value !== null ? value : '';
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: 0,
                        suggestedMax: 100,
                        title: {
                            display: true,
                            text: '分数'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '考试'
                        }
                    }
                }
            }
        });
        
        console.log('趋势图已生成');
        
        // 添加成绩趋势总结和优化建议
        if (window.TrendAnalysis && typeof window.TrendAnalysis.generateTrendSummaryAndSuggestions === 'function') {
            window.TrendAnalysis.generateTrendSummaryAndSuggestions(student, scoreData, selectedSubject);
        } else {
            console.warn('趋势分析模块未正确加载，无法生成总结和优化建议');
        }
    } catch (error) {
        console.error('创建图表时出错:', error);
        const analysisResult = document.getElementById('analysisResult');
        if (analysisResult) {
            analysisResult.innerHTML = `
                <div class="analysis-info">
                    <h3>个人成绩变化趋势分析</h3>
                    <p>生成图表时发生错误，请刷新页面后重试</p>
                    <p class="error-details">错误详情: ${error.message}</p>
                </div>
            `;
        }
    }
}

// 将函数导出到全局作用域
window.fixTrendAnalysisAllSubjectsDisplay = fixTrendAnalysisAllSubjectsDisplay; 