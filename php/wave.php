<?php
header("Content-Type:text/json;charset=UTF-8");
date_default_timezone_set("PRC");
$data=file_get_contents("../js/bolang.js");
echo $data;
?>