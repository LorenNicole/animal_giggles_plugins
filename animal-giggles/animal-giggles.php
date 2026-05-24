<?php
/**
 * Plugin Name: Animal Giggles
 * Plugin URI:  https://example.com/
 * Description: Provides a shortcode that renders three custom multi-state select controls for animal head, body, and butt selections.
 * Version:     1.0.0
 * Author:      Your Name
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: animal-giggles
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AG_PLUGIN_VERSION', '1.0.0' );
define( 'AG_PLUGIN_FILE', __FILE__ );
define( 'AG_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'AG_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once AG_PLUGIN_DIR . 'includes/class-animal-giggles-logger.php';
require_once AG_PLUGIN_DIR . 'includes/class-animal-giggles.php';
require_once AG_PLUGIN_DIR . 'includes/class-animal-giggles-data-service.php';
require_once AG_PLUGIN_DIR . 'includes/class-animal-giggles-router.php';
require_once AG_PLUGIN_DIR . 'includes/class-animal-giggles-config.php';

function ag_run_plugin() {
	$config = new Animal_Giggles_Config();

	$ajax_service = new Animal_Giggles_Data_Service();
	$ajax_service->init();

	$plugin = new Animal_Giggles( $config, $ajax_service );
	$plugin->init();
	
	$router = new Animal_Giggles_Router();
	$router->init();
}
ag_run_plugin();
