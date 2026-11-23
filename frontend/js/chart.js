/**
 * Bộ điều khiển Biểu đồ Thống kê (chart.js)
 * Trực quan hóa dữ liệu môi trường đô thị từ SQL Server
 */

class ChartController {
  constructor() {
    this.typeChart = null;
    this.statusChart = null;
  }

  renderDashboardCharts(stats) {
    if (!window.Chart || !stats) return;

    this.renderTypeChart(stats.byType || []);
    this.renderStatusChart(stats);
  }

  renderTypeChart(byType) {
    const canvas = document.getElementById('chartPollutionTypes');
    if (!canvas) return;

    const labels = byType.map(t => t.name || t.type_name || 'Khác');
    const data = byType.map(t => Number(t.count) || 0);

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

  renderStatusChart(stats) {
    const canvas = document.getElementById('chartStatusProgress');
    if (!canvas) return;

    // Tính số lượng theo trạng thái tiếng Việt từ mảng byStatus của Backend
    const byStatus = stats.byStatus || [];
    let pending = 0;
    let processing = 0;
    let completed = 0;
    let rejected = 0;

    byStatus.forEach(item => {
      const count = Number(item.count) || 0;
      if (item.status === 'Chờ tiếp nhận') pending += count;
      else if (['Đã tiếp nhận', 'Đã xác minh', 'Đang xử lý'].includes(item.status)) processing += count;
      else if (item.status === 'Hoàn thành') completed += count;
      else if (item.status === 'Từ chối') rejected += count;
    });

    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    this.statusChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Chờ tiếp nhận', 'Đang xử lý', 'Hoàn thành', 'Từ chối'],
        datasets: [{
          label: 'Số lượng phản ánh',
          data: [pending, processing, completed, rejected],
          backgroundColor: [
            '#f59e0b', // Vàng cam - Chờ tiếp nhận
            '#3b82f6', // Xanh dương - Đang xử lý
            '#10b981', // Xanh ngọc - Hoàn thành
            '#ef4444'  // Đỏ - Từ chối
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