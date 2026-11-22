/**
 * Chart Controller (Chart.js)
 * Trực quan hóa dữ liệu thống kê môi trường đô thị
 */

class ChartController {
  constructor() {
    this.typeChart = null;
    this.statusChart = null;
  }

  renderDashboardCharts(stats) {
    if (!window.Chart || !stats) return;

    this.renderTypeChart(stats.byType || []);
    this.renderStatusChart(stats.overview || {});
  }

  renderTypeChart(byType) {
    const canvas = document.getElementById('chartPollutionTypes');
    if (!canvas) return;

    const labels = byType.map(t => t.type_name);
    const data = byType.map(t => t.count);

    if (this.typeChart) {
      this.typeChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    this.typeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#16a34a', // Xanh lá cây - Rác thải
            '#0284c7', // Xanh dương - Nước thải
            '#ea580c', // Cam cháy - Khói bụi
            '#8b5cf6', // Tím nhạt - Tiếng ồn
            '#10b981'
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 16,
              font: { family: "'Be Vietnam Pro', system-ui, sans-serif", size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const val = context.raw || 0;
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                return ` ${context.label}: ${val} vụ (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  renderStatusChart(overview) {
    const canvas = document.getElementById('chartStatusProgress');
    if (!canvas) return;

    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    this.statusChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Chờ duyệt', 'Đang xử lý', 'Hoàn tất', 'Từ chối'],
        datasets: [{
          label: 'Số lượng phản ánh',
          data: [
            overview.pending || 0,
            overview.processing || 0,
            overview.completed || 0,
            overview.rejected || 0
          ],
          backgroundColor: [
            '#f59e0b', // Vàng cam - PENDING
            '#3b82f6', // Xanh dương - PROCESSING
            '#10b981', // Xanh ngọc - COMPLETED
            '#ef4444'  // Đỏ - REJECTED
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.raw} phản ánh`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, font: { family: "'Be Vietnam Pro', sans-serif" } },
            grid: { color: '#f1f5f9' }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Be Vietnam Pro', sans-serif" } }
          }
        }
      }
    });
  }
}

window.chartController = new ChartController();

