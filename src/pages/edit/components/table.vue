
<!-- 模块：表格 -->

<template>
  <div class="comTableBox">
    <div class="comTableTitle">
      <span>节点信息</span>
    </div>

    <el-table class="comTable" :data="tableList" size="mini" border>
      <!-- 计划完成 || 本次调整 -->
      <el-table-column label="" width="100" fixed>
        <template slot-scope="scope">
          <p v-if="scope.row.rowType === 1">计划完成</p>
          <p v-if="scope.row.rowType === 2">本次调整</p>
          <p v-if="scope.row.rowType === 3">审批调整</p>
        </template>
      </el-table-column>

      <!-- 循环节点 -->
      <div v-for="(val, key) in nodeData" :key="'node_' + key">
        <el-table-column v-for="(item, index) in val" :key="index" :label="item" width="150">
          <template slot-scope="scope">
            <div v-if="scope.row[index]">
              <div v-if="scope.row.rowType === 1">
                <!-- 计划完成 -->
                <div>
                  <el-popover popper-class="comPopover" :visible-arrow="false" placement="top" trigger="hover" :content="scope.row[index].maxMinText">
                    <div slot="reference" v-if="scope.row[index].submit_type === 2">
                      <el-input class="comInput" size="mini" placeholder="请输入日期"
                        :class="scope.row[index].error ? 'errorPicker' : ''" v-model="scope.row[index].time"
                        @blur="blur_table(scope.$index, index)"
                      ></el-input>
                    </div>
                    <span class="hover" slot="reference" v-else @click="edit(scope.$index, index)">
                      <span :class="scope.row[index].error ? 'red' : ''">{{scope.row[index].time}}</span>
                      <i class="el-icon-warning warningIcon" v-if="scope.row[index].error"></i>
                    </span>
                  </el-popover>
                </div>
              </div>
              <!-- 本次调整 -->
              <div v-else-if="scope.row.rowType === 2">
                <div v-if="scope.row[index].submit_type === 2 && scope.row[index].error">
                  <el-input class="comInput" :class="scope.row[index].error ? 'errorPicker' : ''" placeholder="请输入异常原因"
                    v-model="scope.row[index].change_remaark" size="mini" @blur="blur_table(scope.$index, index)"
                  ></el-input>
                </div>
                <div style="text-align: left;" v-if="scope.row[index].submit_type !== 2">
                  <p v-if="scope.row[index].change_remaark">调整后：{{scope.row[index].change_plan_time}}</p>
                  <p v-if="scope.row[index].change_remaark">原因：{{scope.row[index].change_remaark}}</p>
                </div>
              </div>
              <!-- 审批调整 -->
              <div v-else-if="scope.row.rowType === 3">
                <div style="text-align: left;" v-if="scope.row[index].audit_process_record">
                  <p>调整后：{{scope.row[index].final_audit_plan_enddate}}</p>
                  <p>原因：{{scope.row[index].audit_process_record}}</p>
                </div>
              </div>
            </div>
            <span v-else></span>
          </template>
        </el-table-column>
      </div>

    </el-table>

    <!-- 弹出层 -->
    <el-dialog class="comDialog" :title="d_data.title" :visible.sync="dialogVisible" width="80%" :close-on-click-modal="false" :close-on-press-escape="false">
      <!-- 弹出层：表单 -->
      <div class="lineBox">
        <div class="lineLabel">当前节点：</div>
        <div class="lineText">{{d_data.node_name}}</div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">当前日期：</div>
        <div class="lineText">{{d_data.first_plant_enddate}}</div>
        <div class="lineLabel">异常原因：</div>
        <div class="lineText">{{d_data.abnormal_reason}}</div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">是否调整日期：</div>
        <div class="lineText">
          <el-radio v-model="d_data.is_change" :label="1">是</el-radio>
          <el-radio v-model="d_data.is_change" :label="0">否</el-radio>
        </div>
        <div class="lineLabel">调整后日期：</div>
        <div class="lineText">
          <el-input class="comInput" :disabled="d_data.is_change === 0 ? true : false" slot="reference" size="mini" placeholder="请输入日期"
            v-model="d_data.change_plan_time" @blur="blur_dialog"
          ></el-input>
        </div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">日期最小值：</div>
        <div class="lineText">
          {{d_data.min_plant_enddate}}
        </div>
        <div class="lineLabel">日期最大值：</div>
        <div class="lineText">
          {{d_data.max_plant_enddate}}
        </div>
      </div>
      <div class="lineBox">
        <div class="lineLabel"><span class="red">*&nbsp;</span>调整/异常原因：</div>
        <div class="lineText">
          <el-input class="comInput2" v-model="d_data.change_remaark" size="mini" placeholder="请填写调整/异常原因"></el-input>
        </div>
      </div>
      <!-- 弹出层：按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="submit(d_data.title)">保 存</el-button>
        <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  data() {
    return {
      /* 弹出层 */
      dialogVisible: false, // 弹出层：是否显示
      d_data: {} //            弹出层：数据
    }
  },
  computed: {
    ...mapState(['nodeData']),
    ...mapGetters(['tableList'])
  },
  methods: {
    /**
     * [失焦：表格input]
     * @param {[Int]}    index   表格行索引
     * @param {[String]} node_id 节点ID
     */
    blur_table(index, node_id) {
      this.$store.commit('saveData', { name: 'changeIndexId', obj: `${index}_${node_id}` })
      this.$store.commit('saveData', { name: 'computedTime', obj: true })
    },
    /**
     * [弹出层：修改]
     * @param {[Int]}    index  行索引
     * @param {[String]} nodeId 当前列（节点）ID
     */
    edit(index, nodeId) {
      const row = this.tableList[index]
      const { node_name, time: first_plant_enddate, change_remaark, is_change, time: change_plan_time, abnormal_reason, max_plant_enddate, min_plant_enddate, is_quote } = row[nodeId]
      /* 赋值 */
      const d_data = {
        index, //               行索引
        title: '节点调整', //    弹出层标题
        nodeId, //              节点ID
        node_name, //           当前异常节点
        first_plant_enddate, // 系统计算日期
        abnormal_reason, //     异常原因
        is_change, //           是否调整日期
        is_computed: false, //  是否根据当前节点的时间去计算其他节点
        change_plan_time, //    调整后日期
        change_remaark, //      调整/异常原因
        max_plant_enddate, //   日期最大值
        min_plant_enddate, //   日期最小值
        is_quote //             是否被其他节点引用进行计算1是0否
      }
      this.d_data = d_data
      this.dialogVisible = true
    },
    /**
     * [失焦：弹出层日期]
     */
    blur_dialog() {
      this.d_data.change_plan_time = this._toggleTime(this.d_data.change_plan_time)
    },
    /**
     * [弹出层：保存]
     */
    submit(title) {
      const { index, nodeId, change_remaark, is_change, change_plan_time, first_plant_enddate, is_quote } = this.d_data
      if (!change_remaark) {
        /* 报错：没写调整原因 */
        this.$message({ message: '请填写调整/异常原因', type: 'warning' })
      } else if (is_change === 1 && is_quote === 1 && (!change_plan_time || change_plan_time === '/' || isNaN(new Date(change_plan_time).getTime()))) {
        /* 报错：变更 && 被引用 && 调整后日期不正確 */
        this.$message({ message: '此节点被其他节点引用，请填写正确的 调整后日期 后再保存', type: 'warning' })
      } else if (is_change === 1 && first_plant_enddate === change_plan_time) {
        /* 报错：变更 && 当前日期 === 调整后日期 */
        this.$message({ message: '系统计算日期 不能等于 调整后日期', type: 'warning' })
      } else {
        this.tableList[index][nodeId].time = change_plan_time
        this.tableList[index][nodeId].change_plan_time = change_plan_time
        this.tableList[index][nodeId].is_change = is_change
        this.tableList[index][nodeId].change_remaark = change_remaark
        this.$store.commit('saveData', { name: 'changeIndexId', obj: `${index}_${nodeId}` })
        this.$store.commit('saveData', { name: 'computedTime', obj: true })
        this.dialogVisible = false
      }
    },
    _getTime() {
      const d = new Date()
      const year = d.getFullYear()
      const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
      const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
      return `${year}-${month}-${day}`
    },
    /**
     * [转换：年年年年-月月-日日]
     * @param {[String]} time 输入的日期格式字符串
     */
    _toggleTime(time) {
      if (time === '/') {
        return time
      } if (time) {
        const [three, two, one] = time.split(/[-//.]/g).reverse()
        /* 处理：年 */
        let year = parseInt(new Date().getFullYear()) // 年 {[Int]}
        if (!isNaN(parseInt(one))) {
          const str = String(one).trim()
          year = parseInt(String(year).slice(0, -1 * str.length) + str)
        }
        /* 处理：月 */
        let addYear = 0 // 增加的年份 {[Int]}
        let month = isNaN(parseInt(two)) ? 1 : parseInt(two) // 月 {[Int]}
        for (let i = 0; ; i++) {
          if (month > 12) {
            addYear++
            month -= 12
          } else {
            break
          }
        }
        year = year + addYear
        /* 处理：日 */
        let year_2 = month < 12 ? year : year + 1
        let month_2 = month < 12 ? month + 1 : month + 1 - 12
        let day = isNaN(parseInt(three)) ? 1 : parseInt(three) // 日 {[Int]}
        for (let i = 0; ; i++) {
          const maxDay = new Date(new Date(`${year_2}-${month_2}`).getTime() - 1000 * 60 * 60 * 24).getDate()
          if (day > maxDay) {
            day -= maxDay
            month++
            month_2++
            if (month > 12) {
              month -= 12
              year += 1
              year_2 += 1
            }
            if (month_2 > 12) {
              month_2 -= 12
            }
          } else {
            break
          }
        }
        /* 整合 */
        return `${year}-${'00'.slice(0, -1 * String(month).length) + month}-${'00'.slice(0, -1 * String(day).length) + day}`
      } else {
        return ''
      }
    }
  }
}
</script>

<style scoped>
.comTableBox {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.comTable {
  border-top: 0;
}
.comTableTitle {
  color: #409EFF;
  font-size: 14px;
  padding: 10px;
  background: #ecf5ff;
  flex: 1;
}

/*** 表格容器 ***/
.tableP {
  text-align: left;
}
.tableInput {
  width: 100%;
}
.tableSelect {
  width: 100px;
}
.comInput {
  width: 125px;
  margin: 2px 0;
}
.warningIcon { /* 报错 */
  color: #F56C6C;
  font-size: 16px;
}
.red {
  color: #F56C6C;
}
.hover {
  cursor: pointer;
}
.editIcon { /* 编辑图标 */
  color: #409EFF;
  font-size: 14px;
}

/*** 弹出层 ***/
.lineBox {
  font-size: 12px;
  border-bottom: 1px solid #E4E7ED;
  border-left: 1px solid #E4E7ED;
  display: flex;
  align-items: center;
  flex: 1;
}
.lineBox:first-child {
  border-top: 1px solid #E4E7ED;
}
.lineLabel {
  width: 110px;
  min-width: 110px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.lineText {
  min-height: 35px;
  padding: 0 6px;
  border-right: 1px solid #E4E7ED;
  display: flex;
  align-items: center;
  flex: 1;
}
.comInput2 {
  flex: 1;
}

/*** 角标 ***/
.badge {
  font-size: 6px;
  position: absolute;
  top: 2px;
  right: -50px;
  transform: rotate(35deg);
  transform-origin: center;
  color: #ffffff;
  font-size: 10px;
  line-height: 16px;
  background: #C0C4CC;
  padding: 0 50px;
}
</style>

<style>
/*** 弹出气泡 ***/
.el-popover {
  max-width: 400px !important;
}

/*** 时间选择器：报错 ***/
.errorPicker > input {
  color: #F56C6C !important;
  border-color: #F56C6C !important;
}

/*** 表格 ***/
.comTable td {
  overflow: hidden !important;
}
</style>
