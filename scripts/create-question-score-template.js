/**
 * 小题得分分析模板生成脚本
 * 使用XLSX库生成一个用于小题得分分析的Excel模板文件
 */

// 检查是否已加载XLSX库
if (typeof XLSX === 'undefined') {
    console.error('XLSX库未加载，无法生成模板');
    alert('无法生成模板文件，请确保系统正常运行');
} else {
    console.log('开始生成小题得分分析模板...');
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    
    // 创建示例数据
    const data = [
        ['学号', '姓名', '小题1(10分)', '小题2(10分)', '小题3(10分)', '小题4(15分)', '小题5(15分)', '小题6(20分)', '小题7(20分)', '总分(100分)'],
        ['01', '张三', 8, 7, 9, 12, 13, 16, 17, 82],
        ['02', '李四', 9, 8, 10, 14, 12, 18, 16, 87],
        ['03', '王五', 7, 6, 8, 11, 10, 15, 14, 71],
        ['04', '赵六', 10, 9, 8, 15, 14, 19, 18, 93],
        ['05', '钱七', 6, 7, 9, 10, 11, 14, 15, 72]
    ];
    
    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // 设置列宽
    const colWidths = [
        { wch: 8 },   // 学号
        { wch: 10 },  // 姓名
        { wch: 12 },  // 小题1
        { wch: 12 },  // 小题2
        { wch: 12 },  // 小题3
        { wch: 12 },  // 小题4
        { wch: 12 },  // 小题5
        { wch: 12 },  // 小题6
        { wch: 12 },  // 小题7
        { wch: 14 }   // 总分
    ];
    worksheet['!cols'] = colWidths;
    
    // 添加说明工作表
    const instructionData = [
        ['小题得分分析模板使用说明'],
        [''],
        ['1. 本模板专门用于"个人小题得分情况分析"功能'],
        ['2. 请务必保留"学号"和"姓名"列，用于识别学生'],
        ['3. "小题X(Y分)"格式中，X表示题号，Y表示该题满分值'],
        ['4. 您可以根据实际情况增减小题列，系统会自动识别'],
        ['5. 建议在小题列名中包含"小题"、"题"等关键词，以便系统更准确识别'],
        ['6. 总分列为可选列，用于显示学生总得分'],
        ['7. 上传数据后，请在"数据分析"模块选择"个人小题得分情况分析"功能'],
        [''],
        ['填写说明：'],
        ['- 学号：填写学生编号，如01、02等'],
        ['- 姓名：填写学生姓名'],
        ['- 小题分数：填写学生在各小题的实际得分'],
        ['- 总分：可选，填写学生的总得分']
    ];
    
    const instructionSheet = XLSX.utils.aoa_to_sheet(instructionData);
    
    // 设置说明工作表的列宽
    instructionSheet['!cols'] = [{ wch: 80 }];
    
    // 设置说明工作表的行高
    const rowHeights = {};
    for (let i = 0; i < instructionData.length; i++) {
        rowHeights[i] = { hpt: 20 }; // 设置行高为20pt
    }
    instructionSheet['!rows'] = rowHeights;
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, instructionSheet, '使用说明');
    XLSX.utils.book_append_sheet(workbook, worksheet, '示例数据');
    
    // 生成Excel文件并保存
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    
    // 转换为Blob
    const buffer = new ArrayBuffer(excelData.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < excelData.length; i++) {
        view[i] = excelData.charCodeAt(i) & 0xFF;
    }
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '小题得分分析模板.xlsx';
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    console.log('小题得分分析模板生成完成');
} 