---
title: ThinkPHP5博客搭建知识汇总
date: 2018-02-26 16:11:40
tags: ThinkPHP
---

工作室第七期培训后期主要以TP5搭建个人博客为主，这里将需要用到的知识笔记做个整理再加一些
扩展~

ThinkPHP的核心就是MVC思想：
- Controller： 控制器，整个应用逻辑交互的处理
- Model：模型，数据库操作的逻辑处理
- View：视图，页面数据的呈现

### 控制器

#### 新建控制器
- 前台控制器目录下（application/index/controller）新建控制器文件User.php

- 书写User.php
  ```
  <?php 
    // 声明命名空间
    namespace app\index\controller;
    // 声明控制器
    class User {
          public function index() {
              return "User控制器下的index方法";
          }
    }
  ?>
  ```
- 地址栏访问：域名/index.php/index/User/index
- 注意：
  - 控制器文件名必须首字母大写，驼峰式命名
  - 控制器名必须跟文件名一一对应
  - 命名空间必须和文件名对应
  - 如果控制器名为驼峰式 UserInfo.php

    ```
    域名/index.php/index/user_info/index
    ```

#### 控制器如何加载页面
- 系统View类
  ```
  $view = new \think\View;
  return $view->fetch();

  use think\View;
  $view = new View();
  return $view->fetch();
  ```
- 系统Controller类
  - 继承系统控制器类
    ```
    use think\Controller;
    class User extends Controller
    ```
  - 直接使用系统控制器类的方法
    ```
    return $this->fetch();
    ```
- 系统函数
  ```
  return view();
  ```

#### 控制器的初始化
- 初始化方法必须继承系统控制器
  ```
  public function _initialize() {
      echo "初始化方法";
  }
  ```
- 只要调用控制器下的任意方法，都会先找初始化方法
- 控制器初始化方法的使用
  - 用来提取控制器下公共的代码
  - 后台权限把控

#### 页面跳转
- 页面跳转基于系统控制器类，所以控制器必须继承系统控制器
- 方法所在路径：
  ```
  www/tp5/thinkphp/library/traits/controller/Jump.php
  ```
- 跳转方式
  - 成功跳转：
    ```
    // $this->success(提示信息,跳转地址,用户自定义数据,跳转跳转,header信息);
    // 跳转地址未设置时 默认返回上一个页面
    $this->success('跳转成功',url('index/index'));
    ```
  - 失败跳转：
    ```
    $this->error('跳转失败');
    ```
- 跳转方法给模板页面的数据
  - $code 返回的状态码  1  0 
  - $msg  页面提示信息
  - $wait  等待时间
  - $url     指定跳转页面，默认返回上一个页面
  - $data   用户自定义返回的数据
- 相关配置文件
  ```
  // 默认跳转页面对应的模板文件
  'dispatch_success_tmpl'  => THINK_PATH . 'tpl' . DS . 'dispatch_jump.tpl',
  'dispatch_error_tmpl'    => THINK_PATH . 'tpl' . DS . 'dispatch_jump.tpl',
  ```
- 修改成功、失败的模板页面
  - 文件目录：`www/tp5/thinkphp/tpl/dispatch_jump.tpl`
    - 修改成功、失败模板页面
  - 用户自定义页面跳转模板
    - 修改配置文件
      ```
      // 默认跳转页面对应的模板文件
      'dispatch_success_tmpl'  => THINK_PATH . 'tpl' . DS . 'success.tpl',
      'dispatch_error_tmpl'    => THINK_PATH . 'tpl' . DS . 'error.tpl',
      ```
    - 在tpl目录下新建 success.tpl 和 error.tpl 模板
    - 自定义书写跳转页面

#### 重定向
- 作用：重定向(Redirect)就是通过各种方法将各种网络请求重新定向到其它位置
- 使用：
  ```
  redirect('跳转地址', '其他参数', code, '隐式参数');
  $this->redirect('index/index', ['id'=>100, 'name'=>'abc']);
  ```

#### 空操作和空控制器

- 空操作
  ```
  // 主要解决一些用户恶意的地址栏输入，导致报错影响交互
  public function _empty() {
      $this->redirect('index/index);
  }
  ```
- 空控制器：controller目录下新建Error.php
  ```
  namespace app\index\controller;
  use think\Controller;

  class Error extends Controller {
      public function index() {
          $this->redirect('index/index');
      }

      public function _empty() {
          $this->redirect('index/index');
      }
  }
  ```
- 注意：
  - 网站上线时每一个控制器都必须添加空操作
  - 不论前台后台都需要写一个空控制器

### 模型

#### 新建数据模型
- 手动新建
  - 打开前台模块（www/tp5/application/index） 新建model目录
  - 在model目录下新建User.php
- 命令新建
  - 切换到项目目录
    ```
    php think make:model app\index\model\Users
    ```
- 注意
  - 数据模型的名字建议和表名一致
  - 如果表名与模型名不一致，可以设置表名
    ```
    protected $table = "user";
    ```
  - 如果表名有下划线，模型名使用驼峰法命名

#### 模型的实例化
- 调用静态方法
  ```
  use app\index\model\User;
  $res=User::get(1);
  dump($res->toArray());
  ```
- 实例化数据模型
  ```
  $user=new \app\index\model\User();
  $res=$user::get(2);
  dump($res->toArray());
  ```
- 使用loader
  ```
  use think\Loader;

  $user=Loader::model("user");
  $res=$user::get(3);
  dump($res->toArray());
  ```
- 使用助手函数
  ```
  $user=model("user");
  $res=$user::get(4);
  dump($res->toArray());
  ```

#### 查询操作
- 单条数据
  ```
  // get方法
    // 使用数字
    $res=User::get(1); // 默认主键
    // 使用数组
    $res=User::get(["name"=>'zgg']);  // 默认查找用户名
    // 使用闭包函数
    $res=User::get(function($query){
        $query->where("id",15);
    });
  // find方法
    $res=User::where("id",13)->find();
  ```
- 多条数据
  ```
  // all
    // 所有数据
    $res=User::all();
    // 字符串
    $res=User::all("1,2,3");
    // 数组
    $res=User::all([5,6,7]);
    // 数组
    $res=User::all(['pass'=>'123']);
    // 闭包
    $res=User::all(function($query){
        $query->where("pass","123")
            ->whereOr("pass","456")
            ->order("id","desc");
    });
  // select 和 all 基本类似
    $res=User::select();
    $res=User::limit(2)->select();
  ```
- 获取值
  ```
  // 获取某个值
  $res=User::where("id",5)->value("name");
  // 获取某列值
  $res=User::column("name","id");
  ```
- 动态查询
  ```
  // getBy字段名, 查询出第一条数据
  $res = User::getByName("user");
  dump($res->toArray());
  ```

#### 增加操作
- 设置属性
  ```
  // 设置属性
  $user = new User();
  $user->name = "user";
  $user->pass = 13;
  $user->age  = 22;
  $user->save(); // 返回影响行数
  ```
- 通过data方法
  ```
  $user=new User();
  $user->data([
    "name"=>"yzmedu22",
    "age"=>"22",
    "pass"=>"qwe",
    ]);
  $user->save(); // 返回影响行数
  ```
- 实例化时
  ```
  $user=new User([
    "name"=>"yzmedu23",
    "pass"=>'zxc',
    "age"=>20
    ]);
  // 返回影响行数
  $user->save();
  // allowField 屏蔽掉数据库中不存在的字段
  $user->allowField(true)->save();
  // 指定插入数据库的字段
  $user->allowField(['name','age'])->save();
  ```
- 获取自增的id
  ```
  dump($user->id);
  ```
- 增加多条数据
  ```
  $user=new User();
  $list=[
    ['name'=>"yzmedu33","age"=>33],
    ['name'=>"yzmedu34","age"=>34]
  ];
  $user->saveAll($list);
  ```
- create方法
  ```
  $user=User::create([
    "name"=>"yzmedu35",
    "age"=>35
  ```

#### 删除操作
```
// $user=User::get(1);
// 返回影响行数
// dump($user->delete());

// 删除主键2
$user=User::destroy(2);

// 删除主键3,4,5
$user=User::destroy("3,4,5");
$user=User::destroy([6,7,8]);

// 删除name
$user=User::destroy(['name'=>"yzmedu23"]);

// 删除多个条件
$user=User::destroy(['name'=>'yzmedu33','age'=>33]);

// 使用闭包
$user=User::destroy(function($query){
    $query->where("id","<","15");
});

// 删除数据
$user=User::where("id",">","19")->delete();
dump($user);
```

#### 修改操作
```
// 设置字段更新数据
    $user=User::get(15);
    $user->age=19;
    $res=$user->save();
    
// 直接数组修改
    $user=new User;
    $res=$user->save(
        [
            "pass"=>"qweasd",
            "age"=>16,
            
        ],["id"=>16]);
        
// 修改数据
    $_POST['name']="yzmedu55";
    $_POST['pass']="pass55";
    $_POST['age']="55";
    $_POST['sex']="nan";
    $_POST['id']=17;
    $user=new User;
    $res=$user->allowField(['name','pass','age'])->save($_POST,['id'=>17]);
    
// 批量更新
    $data=[
        ['id'=>15,'name'=>"abc",'pass'=>456],
        ['id'=>17,'name'=>"abc",'pass'=>456],
    ];
    $user=new User;
    $res=$user->saveAll($data);
    echo User::getLastSql();
    
// 更新操作
    $user=new User;
    $res=$user->where("id",'>','17')->update(['age'=>18]);
    $res=User::where("id","<","18")->update(['pass'=>'zxc']);
    
// 闭包更新数据
    $user=new User;
    $res=$user->save(['name'=>'yunzhimeng'],function($query){
        $query->where("id","15");
    });
```

#### 聚合
```
// 统计数据条数
$tot=User::count();
dump($tot);

// 条件判断
$tot=User::where("age",">",18)->count();
dump($tot);

// 统计最大值
$max=User::max('age');
dump($max);

// 统计最小值
$min=User::min("age");
dump($min);

// 平均值
$avg=User::avg('age');
dump($avg);

// 求和
$sum=User::sum('age');
dump($sum);
```

#### 获取器
- 数据模型
  ```
      // sex 的获取器
      public function getSexAttr($val) {
          $status = [
              '0' => '男',
              '1' => '女'
          ];
          return $status[$val];
      }
      
      // status 获取器
      public function getStatusAttr($value) {
          $status = [
              '0' => '禁用',
              '1' => '正常'
          ];
          return $status[$value];
      }
  ```
- 控制器
  ```
  $user = User::all();
  foreach ($user as $key => $value) {
      dump($value->toArray()); 
      dump($value->sex);        // 经过获取器的操作
      dump($value->getData()); // 不经过获取器的操作
  }
  ```
- 注意
  - 字段为user_status 修改器名字为getUserStatusAttr
  - 字段为status 修改器名字为getStatusAttr

#### 修改器
- 数据模型
  ```
  // 密码 修改器
  public function setPassAttr($value) {
      return md5($value);
  }
  ```
- 控制器
  ```
  // 修改器
  public function setPass() {
      $user = new User();
      $res = $user->save(['pass'=>'123'], ['id'=>'1']);
  }
  ```
- 注意
  - 修改器的触发条件是 save 方法

#### 自动完成
- 修改器与自动完成的区别
  - 修改器：数据赋值时自动进行转换处理
  - 自动完成：没有手动赋值的情况下手动进行处理
- 自动完成
  ```
  // 设置自动完成 无论更新操作和添加操作都会执行
  // protected $auto = ['time', 'sex'];
  protected $auto = [];
  protected $insert = ['create_time'];
  protected $update = ['update_time'];
  // 书写自动完成
  protected function setSexAttr() {
      return 1;
  }
  protected function setCreateTimeAttr() {
      return time();
  }
  protected function setUpdateTimeAttr() {
      return time();
  }
  ```

#### 时间戳
- 系统支持自动写入创建和更新的时间戳字段
  - 配置文件中设置
    ```
    // 自动写入时间戳字段
    'auto_timestamp'  => true,
    ```
  - 数据模型中设置
    ```
    // 设置自动写入时间戳
    protected $autoWriteTimestamp=true;
    ```
- 可以设置字段默认值
  ```
  // 增加时间的字段
  protected $createTime='create_times';
  // 更新时间的字段
  protected $updateTime='update_times';
  ```
- 取消更新时间戳设置
  ```
  protected $updateTime=false;
  ```

### 视图和模板
#### 视图

##### 加载页面
  - 继承系统控制器类
    param1（字符串）：模板渲染
    param2（数组）：模板赋值
    param3（数组）：模板替换
    param4（数组）：
    ```
    return $this->fetch(param1, 2, 3, 4);
    ```
  - 使用助手函数：param与fetch相同
    ```
    return view();
    ```
  - 使用View类（不建议）
    ```
    $view = new View();
    return $view->fetch();
    ```

##### 模板赋值
  - 控制器类中的assign方法
    ```
    $this->assign('name', $name);
    $this->assign('city', $city);
    return view();  // 加载页面
    ```
  - 通过fetch方法
    ```
    return $this->fetch('', ['name'=>$name, 'city'=>$city]);
    ```
  - 助手函数
    ```
    return view('', ['name'=>$name, 'city'=>$city]);
    ```
  - 对象赋值
    ```
    $this->view->name = "zgg";
    $this->view->city = "ganzhou";
    return view();
    ```

##### 模板替换
  - 配置文件更改（全局替换）
    ```
    // 视图输出字符串内容替换
    'view_replace_str'       => [
        '__HOMES__'=>'/static/home/public',
        '__ADMINS__'=>'/static/admin/public',
    ],
    ```
  - 部分替换
    - fetch 方法
      ```
      return $this->fetch('', [], ['__HOMES__'=>'/static/home/public']);
      ```
    - view 函数
      ```
      return view('', [], ['__HOMES__'=>'/static/home/public']);
      ```

##### 模板渲染
  ```
  // 默认加载当前模块 当前控制器 当前方法对应的页面
    return $this->fetch();
    
  // 加载当前模块 当前控制器下的 用户定义页面
    return $this->fetch('jiazai');
    
  // 加载当前模块 User控制器 jiazai页面
    return $this->fetch('User/jiazai');
  ```

#### 模板

##### 模板标签
  - 普通标签
    ```
    // 模板引擎普通标签开始标记
    'tpl_begin'    => '<{',
    // 模板引擎普通标签结束标记
    'tpl_end'      => '}>',
    ```

    ```
    <h2>{$str}</h2>
    ```
  - 标签库标签
    ```
    // 标签库标签开始标记
    'taglib_begin' => '{',
    // 标签库标签结束标记
    'taglib_end'   => '}',
    ```

    ```
    {for start="1" end="10"}
        {$i}
    {/for}
    ```

##### 变量输出
  - 字符串
    ```
    // 分配字符串
    $this->assign("str", "TP5.0");
    ```
  - 数组
    ```
    // 分配数组
    $data = [
        "name" => "zgg",
        "age"  => 19,
    ];
    $this->assign("data", $data);
    ```

##### 使用函数
  - 竖线
    ```
    <h2>{$pass|md5}</h2>
    <!-- <h2><?php echo md5($pass); ?></h2> -->

    <h2>{$time|date="Y-m-d H:i:s",###}</h2>
    <!-- <?php echo date("Y-m-d H:i:s",$time);?> -->

    <h2>{$pass|md5|strtoupper|substr=0,10}</h2>
    <!-- <h2><?php echo substr(strtoupper(md5($pass)),0,10); ?></h2> -->
    ```
  - 冒号开始
    ```
    <h2>{:md5($pass)}</h2>
    <h2>{:date('Y-m-d H:i:s',$time)}</h2>
    ```

##### 默认值
  ```
  <h2>{$name|default="小云"}</h2>
  <h2><?php echo (isset($name) && ($name !== '')?$name:"小云"); ?></h2>
  ```

##### 三元运算符
  ```
  <h2>{$status?'正常':'错误'}</h2>
  <h2>{$status>2?'正常':'错误'}</h2>
  <h2><?php echo !empty($status) && $status>2?'正常':'错误'; ?></h2>
  ```

##### 运算符
  ```
  <h2>{$a}+{$b}={$a+$b}</h2>
  <h2>{$a}-{$b}={$a-$b}</h2>
  <h2>{$a}*{$b}={$a*$b}</h2>
  <h2>{$a}/{$b}={$a/$b}</h2>
  <h2>{$a}%{$b}={$a%$b}</h2>
  <h2>{$a++}</h2>
  <h2>{$b--}</h2>
  ```

##### 原样输出
  ```
  {literal}
    <h2>hello {$name}</h2>
  {/literal}
  ```

##### 系统变量
  - 系统变量：支持输出  `$_SERVER、$_ENV、$_POST、$_GET、$_REQUEST、$_SESSION、$_COOKIE `

    ```
    <h1>{$_GET['id']}</h1>
    <h1>{$Think.get.id}</h1>
    <h1>{$_SERVER['HTTP_HOST']}</h1>
    <h1>{$Think.SERVER.http_host}</h1>
    ```
  - 常量输出：详见附录
    ```
    <h1>{$Think.const.app_path}</h1>
    <h1>{$Think.app_path}</h1>
    <h1>{$Think.ds}</h1>
    <h1>{$Think.think_path}</h1>
    <h1>{$Think.IS_WIN}</h1>
    <h1>{$Think.THINK_VERSION}</h1>
    ```
  - 配置文件输出：常看配置文件
    ```
    <h2>{$Think.config.app_namespace}</h2>
    <h2>{$Think.config.default_lang}</h2>
    ```

##### 模板注释
  ```
  <h1>{//$_GET['id']}</h1>
  <h1>{/*$Think.get.id*/}</h1>
  ```

##### 包含文件
  ```
  {include file="Public/header"}
  {include file="Public/footer,Public/footer"}
  ```

##### 模板布局
  - 视图目录下新建 `layout.html`
  - `layout.html` 页面中将所有的公共部分保留，非公共部分使用 `{__CONTENT__}` 替代
     `{__CONTENT__}`  只能存在一个
  - 页面中如何书写
    ```
    # 引入模板布局
    {layout name="layout"/}
    # 非公共区域内容
    <!-- 内容 -->
    <div class="col-md-10">
        <div class="jumbotron">
            <img src="__ADMINS__/img/4.jpg"height="310px" width="100%"
    alt="">
            <h2>联想 后台管理系统</h2>
            <p>开发者 ： 赵丰泰</p>
        </div>
    </div>
    ```

##### 模板继承
  - 视图目录下新建 `base.html`
  - `base.html` 中对页面进行分割
    ```
    <div class="container">
        {block name="nav"}{/block}
        <div class="row body">
            {block name="menu"}{/block}
            {block name="main"}{/block}
        </div>
    </div>
    ```
  - 使用继承
    ```
    {extend name="base" /}

    {block name="nav"}
        {include file="public/nav" /}
    {/block}

    {block name="main"}
        <div class="jumbotron">
            <h2>联想 后台管理系统</h2>
            <p>开发者 ： 赵丰泰</p>
        </div>
    {/block}
    ```

##### 内置标签
  - volist 循环
    - name：需要遍历的数据
    - id：类似 foreach 中 value
    - offset：截取数据的起始位置
    - length：截取数据的个数
    - mod：奇偶数
    - empty：数据为空的使用
    - key：编号
  - foreach 循环
    - name：需要遍历的数据
    - item：类似 foreach 中 value
    - key：类似 foreach 中 key
      ```
      {foreach name="data" item="val" key="abc"}
        <p> {$abc} {$val.id} {$val.name}</p>
      {/foreach}
      ```
  - for 循环
    - start：开始值
    - end：结束值
    - comparison：比较条件
    - step：步数
    - name：循环变量名 默认 i
      ```
      {for start="0" end="10" comparison="elt" step="2" name="abc"}
        <p>{$abc}</p>
      {/for}

      {for start="10" end="0" comparison="gt" step="-1"}
        <p>{$i}</p>
      {/for}
      ```
  - 比较标签
    ```
    {eq name="a" value="11"}正确{/eq}
    {neq name="a" value="11"}正确{/neq}
    {lt name="a" value="11"}正确{/lt}
    {gt name="a" value="11"}正确{/gt}
    {egt name="a" value="11"}正确{/egt}
    {elt name="a" value="11"}正确{/elt}
    {heq name="a" value="11"}正确{/heq}
    {nheq name="a" value="11"}正确{/nheq}
    ```
  - if
    ```
    {if condition="$a eq $b"}
        <p>a和b数值相等</p>
    {else /}
        <p>a和b数值不相等</p>
    {/if}
    ```
  - switch
    ```
    {switch name="week"}
        {case value='1'}周一{/case}
        {case value='2'}周二{/case}
        {default /} 周日
    {/switch}
    ```
  - in 和 notin
    ```
    {in name="week" value="0,1,2,3,4,5,6"}
        合法的数据
    {else /}
        不合法数据
    {/in}
    ```
  - between 和 notbetween
    ```
    {between name="week" value="0,6"}
        合法数据
    {else/}
        非法数据
    {/between}
    ```
  - 原生PHP
    ```
    {php}
        echo "123";
    {/php}
    <?php 
        echo "456";
     ?>
    ```

### Session与Cookie

#### Session
- 设置 Session
  ```
  Session::set('name', 'zgg');
  session('name', '100');
  ```
- 获取 Session
  ```
  Session::get('name');
  session('name');  // 返回 获取到的值 NULL
  ```
- 判断是否设置
  ```
  Session::has('name');
  session("?name");  // 返回 true false
  ```
- 删除 Session
  ```
  Session::delete("data");
  session('name', null);  // 无返回值
  ```
- 清空 Session
  ```
  Session::clear();
  session(null);
  ```

#### Cookie
- 设置 Cookie
  ```
  Cookie::set('name', 'zgg', 3600);
  cookie('name', '100', 3600);
  ```
- 获取 Cookie
  ```
  Cookie::get('name');
  cookie('name');  // 返回 获取到的值 NULL
  ```
- 判断是否设置
  ```
  Cookie::has('name');
  cookie("?name");  // 返回 true false
  ```
- 删除 Cookie
  ```
  Cookie::delete("data");
  cookie('name', null);  // 无返回值
  ```
- 清空 Cookie
  ```
  Cookie::clear();
  cookie(null);
  ```

### 验证器

#### 控制器中使用验证器

            // 实例化验证器类

            $validate=new Validate(
                [
                    "username"=>"require|length:6,12",
                    "password"=>"require|confirm:repassword"
                ],
                [
                    "username.require"=>'用户名不存在',
                    "username.length"=>'用户名长度不满足',
                    "password.require"=>'密码不存在',
                    "password.confirm"=>'两次密码不一致',
                ]
            );

            // 接收用户提交的数据
            $data=input("post.");

            // 进行验证
            if ($validate->check($data)) {
                
            }else{
                dump($validate->getError());
            }

### 分页

- 控制器中书写：
  ```
  $data = Db::table("user")->paginate(3);
  $data = Db::table("user")->paginate(3, true);  // 简化版效果

  $this->assign("data", $data);
  return $this->fetch();
  ```
- 页面中书写
  ```
  {volist name="data" id="val"}
    <tr>
        <td>{$val.id}</td>
        <td>{$val.name}</td>
        <td>{$val.pass}</td>
    </tr>
    
  {/volist}

  {$data->render()}
  ```