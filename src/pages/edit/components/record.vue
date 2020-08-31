
<!-- 历史审核记录 -->

<template>
  <div class="recordBox">
    <div class="comTableTitle">
      <span>历史审核记录</span>
    </div>

    <el-table :data="adjusmentAuditMapList" size="mini" border>
      <el-table-column prop="order_time" label="处理人">
        <template slot-scope="scope">
          {{scope.row.audit_employeename}}
        </template>
      </el-table-column>
      <el-table-column prop="order_time" label="处理时间">
        <template slot-scope="scope">
          {{scope.row.audit_time}}
        </template>
      </el-table-column>
      <el-table-column prop="order_time" label="处理结果">
        <template slot-scope="scope">
          {{audit_result_obj[scope.row.audit_result]}}
        </template>
      </el-table-column>
      <el-table-column prop="order_time" label="处理意见">
        <template slot-scope="scope">
          {{scope.row.audit_remark}}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      audit_result_obj: { '0': '发起申请', '1': '通过', '2': '驳回', '3': '驳回后重新发起', '4': '撤销申请', '5': '撤销后重新发起' }
    }
  },
  computed: {
    ...mapState(['adjusmentAuditMapList'])
  }
}
</script>

<style scoped>
.recordBox {
  flex: 1;
}
.comTableTitle {
  color: #409EFF;
  font-size: 14px;
  padding: 10px;
  background: #ecf5ff;
  flex: 1;
}
</style>
