<template>
  <div>
    <!-- 面包屑导航 -->
    <br>
    <el-breadcrumb separator-class="el-icon-arrow-right" style="margin-left: 20px">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>社区资产</el-breadcrumb-item>
      <el-breadcrumb-item>小区信息</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-card>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item label="小区名称" prop="communityName">
        <el-input
            v-model.trim="queryParams.communityName"
            placeholder="请输入小区名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="小区编码" prop="communityCode">
        <el-input
            v-model.trim="queryParams.communityCode"
            placeholder="请输入小区编码"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete()"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="info"
            plain
            icon="el-icon-upload2"
            size="mini"
            @click="handleImport"
        >导入
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
            @click="derive()"
        >导出
        </el-button>
      </el-col>
    </el-row>

    <el-table :data="communityList" @selection-change="selectionChangeHandle" ref="list">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="小区id" align="center" key="communityId" prop="communityId"/>
      <el-table-column label="小区名称" align="center" key="communityName" prop="communityName"/>
      <el-table-column label="小区编码" align="center" key="communityCode" prop="communityCode"/>
      <el-table-column label="省" align="center" key="communityProvenceCode">
        <template slot-scope="scope">{{ addressText(scope.row.communityProvenceCode) }}</template>
      </el-table-column>
      <el-table-column label="市" align="center" key="communityCityCode">
        <template slot-scope="scope">{{ addressText(scope.row.communityCityCode) }}</template>
      </el-table-column>
      <el-table-column label=" 区/县" align="center" key="communityTownCode">
        <template slot-scope="scope">{{ addressText(scope.row.communityTownCode) }}</template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime|dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center"   prop="remark"/>
      <el-table-column label="操作" align="center" width="200px" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="scope.row.roleId !== 1">
          <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="deleteRole(scope.row)"
          >删除
          </el-button>
          <el-button
              size="mini"
              type="text"
              icon="el-icon-loading"
              @click="replacement(scope.row)"
          >更换物业
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.current"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryParams.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body :before-close="cancel" @close="cancel()">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-form-item label="id" prop="communityId" hidden="hidden" v-if="form.communityId != '0'" :style="{ opacity: '0.5' }"
                        :class="{ 'readonly-input': true }">
            <el-input v-model.trim="form.communityId" placeholder="请输入id" readonly/>
          </el-form-item>
          <el-form-item label="小区名称" prop="communityName">
            <el-input v-model.trim="form.communityName" placeholder="请输入名称"/>
          </el-form-item>

          <el-form-item label="所属区域" prop="selectedOptions">
            <el-cascader
                size="large"
                :options="options"
                v-model="selectedOptions"
                @change="handleChange">
            </el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="communityDetailedAddress">
            <el-input v-model.trim="form.communityDetailedAddress" placeholder="请输入名称"/>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model.trim="form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRole()">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
        title="提示"
        :visible.sync="dialogVisible"
        append-to-body :before-close="handleClose"
    >
      <el-table
          :data="deptList"
          style="width: 100%;margin-bottom: 20px;"
          row-key="deptId"
          border
          ref="multipleTable"
          tooltip-effect="dark"
          default-expand-all
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
        <el-table-column
            prop="deptName"
            label="部门名称"
            sortable
            width="180">
        </el-table-column>
        <el-table-column
            prop="status"
            label="状态">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status==0">正常</el-tag>
            <el-tag v-if="scope.row.status==1" type="danger">停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            label="创建时间">
          <template slot-scope="scope">
            {{ scope.row.createTime | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column
            label="操作">
          <template slot-scope="scope">
            <el-button
                style="border: none;"
                :disabled="scope.row.status !=='0'"
                v-if="scope.row.deptId !== form2.deptId && scope.row.deptId !== 100"
                @click="updReal(scope.row)">选择</el-button>
            <el-button
                style="border: none;"
                v-if="scope.row.deptId === form2.deptId"
                :style="{ color: 'red' }">已选择</el-button>
          </template>
          <!--          <template slot-scope="scope">-->
          <!--            <button @click="updReal(scope.row)">-->
          <!--                {{ scope.row.deptId}}-->
          <!--            </button>-->
          <!--          </template>-->
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updReplaCement()">确 定</el-button>
      </span>
    </el-dialog>
      <!-- 用户导入对话框 -->
      <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
        <el-upload
            ref="upload"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            class="upload-demo"
            action="#"
            :before-upload="beforeAvatarUpload"
            :http-request="uploadHttpRequest"
            :auto-upload="true"
            name="file"
            drag
            multiple
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip text-center" slot="tip">
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                     @click="importTemplate">下载模板
            </el-link>
          </div>
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="uploadHttpRequest">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 用户导入对话框 -->
      <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
        <el-upload
            ref="upload"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            class="upload-demo"
            action="#"
            :before-upload="beforeAvatarUpload"
            :http-request="uploadHttpRequest"
            :auto-upload="true"
            name="file"
            drag
            multiple
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip text-center" slot="tip">
            <!--          <div class="el-upload__tip" slot="tip">-->
            <!--            <el-checkbox v-model="upload.updateSupport"/>-->
            <!--            是否更新已经存在的用户数据-->
            <!--          </div>-->
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                     @click="importTemplate">下载模板
            </el-link>
          </div>
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="uploadHttpRequest">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </el-dialog>

      </el-card>
  </div>

</template>
<script>
import { regionData,codeToText } from 'element-china-area-data'

export default {
  name: "zy_cumm",
  dicts: ['sys_normal_disable'],
  data() {
    return {
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: {Authorization: window.sessionStorage.getItem("token")},
        // 上传的地址
        url: "http://localhost:8080/ExcelImport/importCommunity"
      },

      isActive: false,
      dialogVisible:false,
      deptList:[],
      options: regionData ,
      // 总条数
      total: 0,
      // 表格数据
      communityList: [],
      //
      multiple: true,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      selectedOptions:[],

      queryParams: {
        current: 1,
        size: 10,
        communityName: "",
        communityCode: "",
        communityProvenceCode:"",
        communityCityCode:"",
        communityTownCode:"",
      },
      //查询条件
      deptInfoTree: {
        deptName: '',
        status: ''
      },
      // 表单参数
      form: {
        communityId: 0,
        communityName: undefined,
        remark: undefined,
        communityDetailedAddress:undefined,
        communityProvenceCode:undefined,
        communityCityCode:undefined,
        communityTownCode:undefined
      },

      form2: {
        communityId: 0,
        deptId:"",
        dept:""
      },
      //导出的对象
      derives: {},

      deptInfo: {
        deptName: '',
        status: ''
      },
      // 表单校验
      rules: {
        communityName: [
          {required: true, message: "该字段不能为空", trigger: "blur"}
        ],
        communityDetailedAddress: [
          {required: true, message: "该字段不能为空", trigger: "blur"}
        ]
      }
    }
  }, created() {
    this.getCommunityList();

  },
  methods: {
    addressText(code){
      return codeToText[code]
    },
    //也可以这样写
    handleChange (value) {
      console.log(value)
    },
    async getCommunityList() {
      const {data: res} = await this.$http.get('zyCommunity/getCommunityAll', {
        params: this.queryParams
      })
      if(res==''){
        return
      }
      this.total = res.data.total
      this.communityList = res.data.records
      const {data: res2} = await this.$http.post("sysDept/treeDeptLists",this.deptInfoTree);
      this.deptList = res2.menuList;

    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1
      this.getCommunityList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        current: 1,
        size: 10,
        communityName: "",
        communityCode: ""
      }
      this.getCommunityList();
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
    },
    //删除角色
    async deleteRole(r) {
      const confirmResult = await this.$confirm('确认要删除' + '"' + r.communityName + '"角色吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      await this.$http.delete('zyCommunity/delCummunity?id=' + r.communityId).then(res => {
        //页码修正
        if (this.queryParams.current > Math.ceil((this.total - 1) / this.queryParams.size)) {
          this.queryParams.current = Math.ceil((this.total - 1) / this.queryParams.size);
        }
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.getCommunityList();
        } else if (res.data.status == 201) {
          this.$message.error(res.data.msg)
        }
      })
    },

    /**
     * 导出方法
     */
    async derive() {
      // this.$refs.list.selection.map(item=>item.dictId)
      const {data: res} = await this.$http.post('excel/Communitylist', this.$refs.list.selection.map(item=>item.communityId))
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }
    },
    //把选中的那条记录的roleId属性放到deriveList中
    selectionChangeHandle(val) {
      this.deriveList = []
      for (let i = 0; i < val.length; i++) {
        //concat方法在数组后追加内容。
        this.deriveList = this.deriveList.concat(val[i].communityId)
      }
      this.multiple = !this.$refs.list.selection.length;
    },

    /** 删除按钮操作 */
    async handleDelete() {
      const confirmResult = await this.$confirm(
          '此操作将永久删除该数据, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete('zyCommunity/delCommunity', {data: this.$refs.list.selection.map(item => item.communityId)});
      if (res.status !== 200) {
        this.$message.error(res.msg);
      } else {
        this.$message.success('删除用户成功')
      }

      this.getCommunityList();
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
      this.resetForm("form")
    },
    //重置信息
    resetForm(refName) {
      if (this.$refs[refName]) {
        this.$refs[refName].resetFields();
      }
    },
    // @size-change页码展示数量点击事件
    handleSizeChange(val) {
      // 更新每页展示数据size
      this.queryParams.size = val
      this.getCommunityList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      // 更新当前页数是第几页
      this.queryParams.current = val
      this.getCommunityList();
    },
    //新增按钮
    handleAdd() {
      this.open = true;
      this.selectedOptions = undefined
      this.reset()
      this.title = "添加";
    },
    //更换物业按钮
    replacement(r) {
      this.dialogVisible = true;
      this.form2.communityId=r.communityId
      this.form2.deptId=r.deptId
    },
    //获取选择的编号信息
    updReal(r){
      this.form2.dept=r.deptId
      // 高亮显示逻辑
    },
    //确定选择
    async updReplaCement(){
      if(this.form2.dept  === this.form2.deptId || this.form2.dept==""){
        this.dialogVisible = false
        this.$message.success('更改成功')
        return
      }
        let res = await this.$http.put("zyCommunity/replacement?communityId="+this.form2.communityId+"&deptId="+this.form2.dept);
        this.dialogVisible = false;
        this.$message.success('更改成功')
        this.getCommunityList()

    },
    /** 修改按钮操作 */
    handleUpdate(r) {
      this.reset()
      this.form.communityId = r.communityId
      this.form.communityName = r.communityName
      this.form.communityDetailedAddress = r.communityDetailedAddress
      this.form.communityId = r.communityId
      this.selectedOptions =!r? []:[r.communityProvenceCode, r.communityCityCode, r.communityTownCode]
      this.open = true;
// this.type=r.dictType;
      this.title = "修改";
    },
    // 表单重置
    reset() {
      this.form = {
        communityId: 0,
        communityName: undefined,
        remark: undefined,
        communityDetailedAddress:undefined,
        communityProvenceCode:"",
        communityCityCode:"",
        communityTownCode:""
      };
    },
    //上传导入
    async uploadHttpRequest() {
      const {data: res} = await this.$http({
        url: 'ExcelImport/importCommunity',
        method: "post",
        headers: {
          "Content-Type": "multipart/form-data;boundary=" + new Date().getTime()
        },
        data: this.format,
      })
      if (res.status == 201) {
        this.$message.error(res.msg);
      } else if (res.status == 200) {
        this.$message.success(res.msg);
      }else {
        this.$message.warning("权限不足!");
      }

    },
    //上传前
    beforeAvatarUpload(file) {
      const fileSuffix = file.name.substring(file.name.lastIndexOf(".") + 1);
      const whiteList = ["xls", "xlsx"];

      if (whiteList.indexOf(fileSuffix) === -1) {
        this.$message.error("上传文件只能是xls、xlsx格式", "error");
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
        return false;
      }
      this.uploadFile = file
      let formData = new FormData();
      formData.append('file', file)
      this.format = formData
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    async importTemplate() {
      const {data: res} = await this.$http.post(`ExcelImport/template`)
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      // this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", {dangerouslyUseHTMLString: true});
      this.getCommunityList();

    },
    // 提交上传文件
    submitFileForm() {
      this.$http.put("ExcelImport/importCommunity", this).then(response => {
        if (response.data.data == 1) {
          this.$message.success("修改成功");
          this.open = false;
          this.getCommunityList();
        } else if (response.data.data==0) {
          this.$message.error("修改失败，重复!");
        }else {
          this.$message.warning("权限不足!");
        }
      });
      this.$refs.upload.submit();
    },

    //修改和新增
    async saveRole() {
      // this.form.status = this.form.status == "正常" ? '0' : '1';
      // 判断是否是null
      // if (this.form.communityName == 0 || this.form.communityDetailedAddress == 0 ||
      //     this.form.communityDetailedAddress == null || this.form.communityName == null) {
      //   this.$message.error("请输入参数")
      //   return
      // }
      this.$refs["form"].validate(async valid => {
        if (valid) {
          //this.form.communityId不为0：修改
          if (this.form.communityId != 0) {
            //获取省市级信息
            this.form.communityProvenceCode = this.selectedOptions[0];
            this.form.communityCityCode = this.selectedOptions[1];
            this.form.communityTownCode = this.selectedOptions[2];

            let res = await this.$http.put("zyCommunity/updCommunity", this.form);
            if (res.data.status === 200) {
              this.open = false;
              this.$message.success("修改成功")
              this.getCommunityList();
            } else {
              this.$message.error(res.data.msg);
            }
          }
          //this.form.communityId为0：新增
          if (this.form.communityId == 0) {
            this.form.communityId = Date.now()
            this.form.communityCode = 'COMMUNITY_' + Date.now()

            this.form.communityProvenceCode = this.selectedOptions[0];
            this.form.communityCityCode = this.selectedOptions[1];
            this.form.communityTownCode = this.selectedOptions[2];

            let res = await this.$http.post("zyCommunity/insCommunity", this.form);
            if (res.data.status === 200) {
              this.open = false;
              this.$message.success("新增成功")
              this.form = {
                communityName: undefined,
                remark: undefined,
                communityDetailedAddress: undefined,
                communityProvenceCode: "",
                communityCityCode: "",
                communityTownCode: ""
              };
              this.getCommunityList();
            } else {
              this.form.communityId = 0
              this.$message.error(res.data.msg);
            }
          }
        }
      })

    },
  }
}
</script>

<style>
.el-cascader-menu {
  max-height: 200px; /* 设置下拉菜单的最大高度 */
  overflow-y: auto; /* 当内容超出最大高度时显示滚动条 */
}
</style>