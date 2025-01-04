import fs from 'fs'
import path from 'path'

const reportData = require('./reportData.json')

interface File {
  id: string
  name: string
}

interface ReportData {
  deletedFiles: File[]
  omittedByKeyword: File[]
  omittedBySafeList: File[]
  omittedDefault: File[]
}

function  generateHtmlReport(data: ReportData) {
  const { deletedFiles, omittedByKeyword, omittedBySafeList, omittedDefault } = data
  const totalFiles = deletedFiles.length + omittedByKeyword.length + omittedBySafeList.length + omittedDefault.length
  const currentDate = new Date().toLocaleDateString('en-US')

  const pieChartScript = `
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', function () {
        const ctx = document.getElementById('pieChart').getContext('2d');
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Deleted', 'Omitted by Keyword', 'Omitted by Safe List', 'Omitted Default'],
            datasets: [{
              data: [${deletedFiles.length}, ${omittedByKeyword.length}, ${omittedBySafeList.length}, ${omittedDefault.length}],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
            }
          }
        });
      });
    </script>
  `

  const tableRows = (files: File[], type: string) =>
    files.map((file) => `<tr data-type="${type}"><td>${file.id}</td><td>${file.name}</td></tr>`).join('')

  const htmlContent = `
    <html>
      <head>
        <title>File Cleanup Report - ${currentDate}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f9f9f9;
            color: #333;
          }
          h1, h2, h3 {
            color: #0056b3;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .summary-table, .chart-container {
            width: 48%;
            display: inline-block;
            vertical-align: top;
          }
          .chart-container {
            height: 300px;
          }
          .filter-buttons {
            margin-bottom: 10px;
          }
          .filter-buttons button {
            margin-right: 5px;
            padding: 8px 12px;
            background-color: #0056b3;
            color: white;
            border: none;
            cursor: pointer;
          }
          .filter-buttons button:hover {
            background-color: #004494;
          }
        </style>
      </head>
      <body>
        <h1>File Cleanup Report - ${currentDate}</h1>
        <div class="summary-table">
          <h2>Summary</h2>
          <table>
            <tr>
              <th>Total Files</th>
              <td>${totalFiles}</td>
            </tr>
            <tr>
              <th>Deleted Files</th>
              <td>${deletedFiles.length}</td>
            </tr>
            <tr>
              <th>Omitted by Keyword</th>
              <td>${omittedByKeyword.length}</td>
            </tr>
            <tr>
              <th>Omitted by Safe List</th>
              <td>${omittedBySafeList.length}</td>
            </tr>
            <tr>
              <th>Omitted Default</th>
              <td>${omittedDefault.length}</td>
            </tr>
          </table>
        </div>
        <div class="chart-container">
          <canvas id="pieChart"></canvas>
        </div>
        ${pieChartScript}
        <div class="filter-buttons">
          <button onclick="filterTable('all')">Show All</button>
          <button onclick="filterTable('deleted')">Show Deleted</button>
          <button onclick="filterTable('keyword')">Show Omitted by Keyword</button>
          <button onclick="filterTable('safelist')">Show Omitted by Safe List</button>
          <button onclick="filterTable('default')">Show Omitted Default</button>
        </div>
        <table id="fileTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows(deletedFiles, 'deleted')}
            ${tableRows(omittedByKeyword, 'keyword')}
            ${tableRows(omittedBySafeList, 'safelist')}
            ${tableRows(omittedDefault, 'default')}
          </tbody>
        </table>
        <script>
          function filterTable(type) {
            const rows = document.querySelectorAll('#fileTable tbody tr');
            rows.forEach(row => {
              if (type === 'all' || row.dataset.type === type) {
                row.style.display = '';
              } else {
                row.style.display = 'none';
              }
            });
          }
        </script>
      </body>
    </html>
  `

  return htmlContent
}

const reportHtml = generateHtmlReport(reportData as ReportData)
fs.writeFileSync(path.resolve(__dirname, 'report.html'), reportHtml)
console.log('Report generated: report.html')
