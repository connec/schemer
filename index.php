<?php

function scandir_r($dir) {
  $results = [];
  foreach(scandir($dir) as $path) {
    if($path[0] == '.')
      continue;
    
    $path = $dir.'/'.$path;
    if(is_file($path))
      $results[] = $path;
    else
      $results = array_merge($results, scandir_r($path));
  }
  return $results;
}

?>

<!DOCTYPE html>
<html>
<head>
  <title>Honours</title>
  <link href="styles/main.css" rel="stylesheet">
  <script src="scripts/coffee-script.js"></script>
  <script src="scripts/jquery.js"></script>
  <script src="scripts/underscore.js"></script>
  <script src="scripts/backbone.js"></script>
  <script src="scripts/jade.js"></script>
  <?php foreach(scandir_r('scripts/src') as $script): ?>
    <script src="<?= $script ?>" type="text/coffeescript"></script>
  <?php endforeach ?>
  <script type="text/coffeescript">
    $ ->
      new HomeView
  </script>
</head>
<body>
  <?php foreach(scandir_r('templates') as $template): ?>
    <?php $name = str_replace('/', '_', substr(substr($template, 0, strrpos($template, '.')), strlen('templates') + 1)) ?>
    <div class="template" id="template_<?= $name ?>">
      <?= file_get_contents($template) ?>
    </div>
  <?php endforeach ?>
</body>
</html>