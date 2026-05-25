<?php
/**
 * Animal Giggles Config class.
 *
 * Centralized configuration for assets and other shared settings.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Animal_Giggles_Config {

	const desktop_breakpoint_min = 768; // pixels
	const FALLBACK_PRODUCT_ID = 'not-found';

	/**
	 * Get uploads base URL.
	 *
	 * @return string
	 */
	protected function get_upload_baseurl() {
		$uploads = wp_upload_dir();
		return trailingslashit( $uploads['baseurl'] );
	}

	/**
	 * Get asset configuration.
	 *
	 * @return array
	 */
	public function get_asset_config() {
		$baseurl = $this->get_upload_baseurl();

		return array(
			'fallback_image' => esc_url( $baseurl . '2026/04/giggle-animal-not-found.jpg' ),
			'social_icons'   => array(
				'facebook'  => esc_url( $baseurl . '2026/04/facebook_icon.png' ),
				'x'         => esc_url( $baseurl . '2026/04/x_twitter_icon.jpg' ),
				'pinterest' => esc_url( $baseurl . '2026/04/pinterest_icon.webp' ),
			),
		);
	}

	public function get_country_options() {
		return array(
			'United States',
			'Argentina',
			'Australia',
			'Austria',
			'Belgium',
			'Brazil',
			'Canada',
			'China',
			'France',
			'Germany',
			'India',
			'Indonesia',
			'Ireland',
			'Israel',
			'Italy',
			'Japan',
			'Mexico',
			'Netherlands',
			'Norway',
			'Poland',
			'Russia',
			'Saudi Arabia',
			'South Korea',
			'Spain',
			'Sweden',
			'Switzerland',
			'Taiwan',
			'Thailand',
			'Turkey',
			'United Kingdom',
			'Other',
		);
	}
}