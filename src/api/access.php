<?php
    $res = ['success'=>false];

    function getParam($key)
    {
        return isset($_REQUEST[$key]) ? $_REQUEST[$key] : '';
    }

    $tx = getParam('tx');
    $idx = getParam('index');

    $json_file_path = "data/$tx.json";
    $json = NULL;
    $success = false;
    if(file_exists($json_file_path)){
        $json = file_get_contents($json_file_path);
        $json = json_decode($json, true);

        if(isset($json[$idx])){
            $json[$idx]['count']++;
            $update = json_encode($json);
            file_put_contents($json_file_path, $update);
            $success = true;
        }
    }
    $res['success'] = $success;
    $res['tx'] = $tx;
    $res['index'] = $idx;
    if(getParam('debug') == 'true'){
        $res['json'] = $json;
    }

    header("Content-Type: application/json");
    header("Expires: on, 01 Jan 1970 00:00:00 GMT");
    header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
    header("Cache-Control: no-store, no-cache, must-revalidate");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");
    echo(json_encode($res));
