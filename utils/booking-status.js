const LABELS = { PENDING: '预约意向待确认', CONFIRMED: '预约已确认', CANCELLED: '预约已取消', REJECTED: '预约未通过', COMPLETED: '预约已完成' };
function normalize(record) {
  return record && Object.assign({}, record, { statusLabel: LABELS[record.status] || '预约状态待核实' });
}
module.exports = { normalize };
