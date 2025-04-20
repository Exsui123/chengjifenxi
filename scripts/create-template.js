// 导入xlsx库
const XLSX = require('xlsx');
const fs = require('fs');

// 确保examples目录存在
if (!fs.existsSync('examples')) {
    fs.mkdirSync('examples');
}

// 创建工作簿和工作表
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet([
    ['学号', '姓名', '语文', '数学', '英语'], // 表头
    ['01', '张三', 85, 90, 95],              // 示例数据
    ['02', '李四', 78, 82, 88],
    ['03', '王五', 92, 88, 85]
]);

// 设置列宽
const colWidth = [
    {wch: 10}, // 学号
    {wch: 15}, // 姓名
    {wch: 10}, // 语文
    {wch: 10}, // 数学
    {wch: 10}  // 英语
];
worksheet['!cols'] = colWidth;

// 将工作表添加到工作簿
XLSX.utils.book_append_sheet(workbook, worksheet, '成绩表');

// 写入到文件
XLSX.writeFile(workbook, 'examples/成绩导入模板.xlsx');

console.log('成绩导入模板已创建成功!'); 