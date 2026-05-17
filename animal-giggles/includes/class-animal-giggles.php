<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Animal_Giggles {

	/**
	 * Shortcode tag.
	 *
	 * @var string
	 */
	const SHORTCODE = 'animal_giggles';
	protected $config;
	protected $ajax_service;

	public function __construct( $config, $ajax_service ) {
		$this->config       = $config;
		$this->ajax_service = $ajax_service;
	}

	/**
	 * Initialize hooks.
	 *
	 * @return void
	 */
	public function init() {
		add_shortcode( self::SHORTCODE, array( $this, 'render_shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'register_assets' ) );
	}

	/**
	 * Register assets.
	 *
	 * @return void
	 */
	public function register_assets() {
		$asset_config = $this->config->get_asset_config();

		error_log( 'AG DEBUG ag_head=' . print_r( get_query_var( 'ag_head' ), true ) );
		error_log( 'AG DEBUG ag_body=' . print_r( get_query_var( 'ag_body' ), true ) );
		error_log( 'AG DEBUG ag_butt=' . print_r( get_query_var( 'ag_butt' ), true ) );
		error_log( 'AG DEBUG ag_product_id=' . print_r( get_query_var( 'ag_product_id' ), true ) );

		$config = $this->ajax_service->get_animal_config();
		$default_image_row = $this->get_default_image_row_data( $config['image_rows'] );

		wp_register_style(
			'ag-frontend',
			AG_PLUGIN_URL . 'assets/css/animal-giggles.css',
			array(),
			AG_PLUGIN_VERSION
		);

		wp_register_script(
			'ag-frontend',
			AG_PLUGIN_URL . 'assets/js/animal-giggles.js',
			array(),
			AG_PLUGIN_VERSION,
			true
		);

		wp_localize_script(
			'ag-frontend',
			'agData',
			array(
				'ajaxUrl'        => admin_url( 'admin-ajax.php' ),
				'nonce'          => wp_create_nonce( 'ag_nonce' ),
				'placeholder'    => __( '- select -', 'animal-giggles' ),
				'headOptions'    => $config['head_options'],
				'bodyOptions'    => $config['body_options'],
				'buttOptions'    => $config['butt_options'],
				'bodyOptionsMap' => $config['body_options_map'],
				'buttOptionsMap' => $config['butt_options_map'],
				'imageRows'      => $config['image_rows'],
				'desktop_breakpoint_min' => Animal_Giggles_Config::desktop_breakpoint_min,
				'defaultImageRow' => $default_image_row,
				'fallbackImage' => $asset_config['fallback_image'],
				'requestedProductId' => (string) get_query_var( 'ag_product_id' ),
				'fallbackProductId' => Animal_Giggles_Config::FALLBACK_PRODUCT_ID,
				'cloudflareBaseUrl' => 'https://images.animalgiggles.com',
			)
		);

	}

	/**
	 * Enqueue frontend assets when needed.
	 *
	 * @return void
	 */
	public function enqueue_assets() {
		wp_enqueue_style( 'ag-frontend' );
		wp_enqueue_script( 'ag-frontend' );
	}

	/**
	 * Determine whether current singular content contains the shortcode.
	 *
	 * @return bool
	 */
	protected function current_post_has_shortcode() {
		if ( ! is_singular() ) {
			return false;
		}

		$post = get_post();

		if ( ! $post || empty( $post->post_content ) ) {
			return false;
		}

		return has_shortcode( $post->post_content, self::SHORTCODE );
	}

	protected function get_default_image_row_data( $image_rows ) {
		global $wpdb;

		$config_table = 'ag_configuration';

		if ( empty( $image_rows ) ) {
			return null;
		}

		$total_rows = count( $image_rows );

		$timezone = new DateTimeZone( 'America/New_York' );
		$now      = new DateTime( 'now', $timezone );
		$today_midnight = new DateTime( $now->format( 'Y-m-d 00:00:00' ), $timezone );

		$config = $wpdb->get_row(
			"SELECT id, default_image_row, default_image_row_updated FROM {$config_table} ORDER BY id ASC LIMIT 1",
			ARRAY_A
		);

		if ( ! $config ) {
			$default_row_number = 1;
			$updated_value      = $today_midnight->format( 'Y-m-d H:i:s' );

			$wpdb->insert(
				$config_table,
				array(
					'default_image_row'         => $default_row_number,
					'default_image_row_updated' => $updated_value,
				),
				array( '%d', '%s' )
			);

			return $this->find_image_row_by_number( $image_rows, $default_row_number );
		}

		$current_row_number = max( 1, (int) $config['default_image_row'] );
		$updated_raw        = isset( $config['default_image_row_updated'] ) ? (string) $config['default_image_row_updated'] : '';

		$updated_dt = $updated_raw ? new DateTime( $updated_raw, $timezone ) : null;

		$needs_rollover = false;

		if ( ! $updated_dt ) {
			$needs_rollover = true;
		} else {
			$updated_day = $updated_dt->format( 'Y-m-d' );
			$today_day   = $today_midnight->format( 'Y-m-d' );

			if ( $updated_day !== $today_day && $now >= $today_midnight ) {
				$needs_rollover = true;
			}
		}

		if ( $needs_rollover ) {
			$current_row_number++;

			if ( $current_row_number > $total_rows ) {
				$current_row_number = 1;
			}

			$wpdb->update(
				$config_table,
				array(
					'default_image_row'         => $current_row_number,
					'default_image_row_updated' => $now->format( 'Y-m-d H:i:s' ),
				),
				array(
					'id' => (int) $config['id'],
				),
				array( '%d', '%s' ),
				array( '%d' )
			);
		}

		$default_row = $this->find_image_row_by_number( $image_rows, $current_row_number );

		if ( ! $default_row ) {
			$current_row_number = 1;

			$wpdb->update(
				$config_table,
				array(
					'default_image_row'         => $current_row_number,
					'default_image_row_updated' => $now->format( 'Y-m-d H:i:s' ),
				),
				array(
					'id' => (int) $config['id'],
				),
				array( '%d', '%s' ),
				array( '%d' )
			);

			$default_row = $this->find_image_row_by_number( $image_rows, $current_row_number );
		}

		return $default_row;
	}

	protected function find_image_row_by_number( $image_rows, $row_number ) {
		foreach ( $image_rows as $image_row ) {
			if ( isset( $image_row['rowNumber'] ) && (int) $image_row['rowNumber'] === (int) $row_number ) {
				return $image_row;
			}
		}

		return null;
	}

	/**
	 * Render shortcode output.
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string
	 */
	public function render_shortcode( $atts = array() ) {
		$this->enqueue_assets();

		$config = $this->ajax_service->get_animal_config();
		$asset_config = $this->config->get_asset_config();

		ob_start();
		?>
		<div class="ag-animal-giggles">
			<div class="gifts-container">

			</div>
			<div class="giggles-container">	
				<button
					type="button"
					id="random-giggle-btn"
					class="ag-random-giggle-btn"
				>
					<?php esc_html_e( 'Surprise Giggle', 'animal-giggles' ); ?>
				</button>	
				<div class="ag-select-group">
					<label for="animal-head" class="animal-part-label"><?php esc_html_e( 'Select a Head', 'animal-giggles' ); ?></label>

					<div class="ag-select-row">
						<select id="animal-head" class="select-dropdown">
							<option value=""><?php esc_html_e( '- select head -', 'animal-giggles' ); ?></option>
							<?php foreach ( $config['head_options'] as $option ) : ?>
								<option value="<?php echo esc_attr( $option['value'] ); ?>">
									<?php echo esc_html( $option['label'] ); ?>
								</option>
							<?php endforeach; ?>
						</select>
					</div>
				</div>

				<div class="ag-select-group">
					<label for="animal-body"  class="animal-part-label"><?php esc_html_e( 'Select a Body', 'animal-giggles' ); ?></label>

					<div class="ag-select-row">
						<select id="animal-body" class="select-dropdown" disabled>
							<option value=""><?php esc_html_e( '- select body -', 'animal-giggles' ); ?></option>
						</select>
					</div>
				</div>

				<div class="ag-select-group">
					<label for="animal-butt"  class="animal-part-label"><?php esc_html_e( 'Select a Butt', 'animal-giggles' ); ?></label>

					<div class="ag-select-row">
						<select id="animal-butt" class="select-dropdown" disabled>
							<option value=""><?php esc_html_e( '- selec butt -', 'animal-giggles' ); ?></option>
						</select>
					</div>
				</div>

				<div class="ag-generated-animal-wrap">
					<div id="ag-generated-animal-text" class="ag-generated-animal-text">
						<?php esc_html_e( 'No animal generated yet.', 'animal-giggles' ); ?>
					</div>

					<div id="ag-generated-animal-request" class="ag-generated-animal-requested-by">
						<div class="ag-generated-animal-requestor-label" aria-label="<?php esc_attr_e( 'Requested by:', 'animal-giggles' ); ?>">
							<?php esc_html_e( 'Requested by:', 'animal-giggles' ); ?>
						</div>
						<div id="ag-requestor-name" class="requestor-name"></div>
						<div id="ag-requestor-country" class="ag-requestor-country"></div>
					</div>

					<button
						type="button"
						id="make-me-giggle-btn"
						class="ag-giggle-btn"
						disabled
					>
						<?php esc_html_e( 'Make Me Giggle', 'animal-giggles' ); ?>
					</button>

					<div id="ag-giggle-image-wrap" class="ag-giggle-image-wrap" hidden>
						<div id="ag-giggle-skeleton" class="ag-giggle-skeleton" aria-hidden="true"></div>
						<canvas id="ag-giggle-canvas" class="ag-giggle-canvas" hidden></canvas>
						<img id="ag-giggle-image" class="ag-giggle-image" src="" alt="" />
					</div>

					<div id="ag-giggle-meter" class="ag-giggle-meter is-disabled">
					<div class="ag-giggle-meter-label">
						<?php esc_html_e( 'Giggle Meter', 'animal-giggles' ); ?>
					</div>

					<div id="ag-rating-stars" class="ag-rating-stars" role="group" aria-label="<?php esc_attr_e( 'Giggle Meter from 1 to 5 stars', 'animal-giggles' ); ?>">
						<button type="button" class="ag-rating-star" data-rating-value="1" aria-label="<?php esc_attr_e( 'Rate 1 star', 'animal-giggles' ); ?>">
							<span class="ag-rating-star-icon" aria-hidden="true">★</span>
						</button>

						<button type="button" class="ag-rating-star" data-rating-value="2" aria-label="<?php esc_attr_e( 'Rate 2 stars', 'animal-giggles' ); ?>">
							<span class="ag-rating-star-icon" aria-hidden="true">★</span>
						</button>

						<button type="button" class="ag-rating-star" data-rating-value="3" aria-label="<?php esc_attr_e( 'Rate 3 stars', 'animal-giggles' ); ?>">
							<span class="ag-rating-star-icon" aria-hidden="true">★</span>
						</button>

						<button type="button" class="ag-rating-star" data-rating-value="4" aria-label="<?php esc_attr_e( 'Rate 4 stars', 'animal-giggles' ); ?>">
							<span class="ag-rating-star-icon" aria-hidden="true">★</span>
						</button>

						<button type="button" class="ag-rating-star" data-rating-value="5" aria-label="<?php esc_attr_e( 'Rate 5 stars', 'animal-giggles' ); ?>">
							<span class="ag-rating-star-icon" aria-hidden="true">★</span>
						</button>
					</div>

					<div id="ag-rating-status" class="ag-rating-status" aria-live="polite"></div>
				</div>

					<div class="ag-action-buttons">
						<!-- <button
							type="button"
							id="download-giggle-btn"
							class="ag-download-btn"
							disabled
							hidden
						>
							<?php esc_html_e( 'Download Image', 'animal-giggles' ); ?>
						</button> -->

						<div class="ag-share-group">
							<button
								type="button"
								id="share-giggle-btn"
								class="ag-share-btn"
								disabled
								hidden
							>
								<?php esc_html_e( 'Copy Link', 'animal-giggles' ); ?>
							</button>

							<button type="button" class="ag-social-btn ag-facebook" data-platform="facebook" hidden>
								<img src="<?php echo esc_url( $asset_config['social_icons']['facebook'] ); ?>" alt="<?php esc_attr_e( 'Share on Facebook', 'animal-giggles' ); ?>">
							</button>

							<button type="button" class="ag-social-btn ag-x" data-platform="x" hidden>
								<img src="<?php echo esc_url( $asset_config['social_icons']['x'] ); ?>" alt="<?php esc_attr_e( 'Share on X', 'animal-giggles' ); ?>">
							</button>

							<button type="button" class="ag-social-btn ag-pinterest" data-platform="pinterest" hidden>
								<img src="<?php echo esc_url( $asset_config['social_icons']['pinterest'] ); ?>" alt="<?php esc_attr_e( 'Share on Pinterest', 'animal-giggles' ); ?>">
							</button>
						</div>
					</div>

					<div id="ag-image-modal" class="ag-image-modal" hidden>
						<div class="ag-image-modal__backdrop"></div>

						<div class="ag-image-modal__dialog" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Animal image preview', 'animal-giggles' ); ?>">
							<div id="ag-giggle-meter-modal" class="ag-giggle-meter ag-giggle-meter-modal is-disabled">
								<label for="ag-rating-stars-modal" class="ag-giggle-meter-label"><?php esc_html_e( 'Giggle Meter', 'animal-giggles' ); ?></label>
								<div id="ag-rating-stars-modal" class="ag-rating-stars ag-rating-stars-modal" role="group" aria-label="<?php esc_attr_e( 'Giggle Meter from 1 to 5 stars', 'animal-giggles' ); ?>">
									<button type="button" class="ag-rating-star ag-rating-star-modal" data-rating-value="1" aria-label="<?php esc_attr_e( 'Rate 1 star', 'animal-giggles' ); ?>">
										<span class="ag-rating-star-icon" aria-hidden="true">★</span>
									</button>

									<button type="button" class="ag-rating-star ag-rating-star-modal" data-rating-value="2" aria-label="<?php esc_attr_e( 'Rate 2 stars', 'animal-giggles' ); ?>">
										<span class="ag-rating-star-icon" aria-hidden="true">★</span>
									</button>

									<button type="button" class="ag-rating-star ag-rating-star-modal" data-rating-value="3" aria-label="<?php esc_attr_e( 'Rate 3 stars', 'animal-giggles' ); ?>">
										<span class="ag-rating-star-icon" aria-hidden="true">★</span>
									</button>

									<button type="button" class="ag-rating-star ag-rating-star-modal" data-rating-value="4" aria-label="<?php esc_attr_e( 'Rate 4 stars', 'animal-giggles' ); ?>">
										<span class="ag-rating-star-icon" aria-hidden="true">★</span>
									</button>

									<button type="button" class="ag-rating-star ag-rating-star-modal" data-rating-value="5" aria-label="<?php esc_attr_e( 'Rate 5 stars', 'animal-giggles' ); ?>">
										<span class="ag-rating-star-icon" aria-hidden="true">★</span>
									</button>
								</div>
							</div>

							<button
								type="button"
								id="ag-image-modal-close"
								class="ag-image-modal__close"
								aria-label="<?php esc_attr_e( 'Close image preview', 'animal-giggles' ); ?>"
							>
								Close
							</button>

							<div class="ag-image-modal__content">
								<div class="ag-image-modal__media">
									<canvas id="ag-image-modal-canvas" class="ag-image-modal__canvas" hidden></canvas>
									<img
										id="ag-image-modal-img"
										class="ag-image-modal__img"
										src=""
										alt=""
									/>
								</div>
							</div>
						</div>
					</div>

					<div id="ag-share-status" class="ag-share-status" aria-live="polite"></div>
				</div>
			</div>
			<div class="requests-container">
				<h3 class="ag-request-title">Request a Custom Animal Giggle</h3>
				<p class="required-field-info"><?php esc_html_e( '* required field', 'animal-giggles' ); ?></p>
				<form id="ag-request-form" class="ag-request-form">
					<div class="label-with-count">
						<label for="request-head"><?php esc_html_e( 'Head *', 'animal-giggles' ); ?></label>
						<div class="char-count" data-for="request-head"></div>
					</div>
					<input id="request-head" type="text" name="head" placeholder="Animal for the Head" maxlength="100" required>
					<div class="label-with-count">
						<label for="request-body"><?php esc_html_e( 'Body *', 'animal-giggles' ); ?></label>
						<div class="char-count" data-for="request-body"></div>
					</div>
					<input id="request-body" type="text" name="body" placeholder="Animal for the Body" maxlength="100" required>
					<div class="label-with-count">
						<label for="request-butt"><?php esc_html_e( 'Butt *', 'animal-giggles' ); ?></label>
						<div class="char-count" data-for="request-butt"></div>
					</div>
					<input id="request-butt" type="text" name="butt" placeholder="Animal for the Butt" maxlength="100" required>
					<div class="label-with-count">
						<label for="request-setting"><?php esc_html_e( 'Setting', 'animal-giggles' ); ?></label>
						<div class="char-count" data-for="request-setting"></div>
					</div>
					<textarea id="request-setting" name="setting" placeholder="Setting for the Animal" maxlength="150"></textarea>
					<div class="label-with-count">
						<label for="request-name"><?php esc_html_e( 'Name', 'animal-giggles' ); ?></label>
						<div class="char-count" data-for="request-name"></div>
					</div>
					<input id="request-name" type="text" name="name" placeholder="Your First Name" maxlength="100">

					<label for="request-country"><?php esc_html_e( 'Country *', 'animal-giggles' ); ?></label>
					<select id="request-country" name="country" required>
						<option value="">- select country -</option>
						<option value="United States">United States</option>
						<option value="Canada">Canada</option>
						<option value="United Kingdom">United Kingdom</option>
						<option value="Australia">Australia</option>
						<option value="Other">Other</option>
					</select>

					<label class="ag-consent">
						<input type="checkbox" name="consent" required>
						I agree that my name and country may be shown with the generated image on this website.
					</label>
					<button type="submit" class="request-giggle-btn">Request Animal Giggle</button>
					<p class="request-status request-info"><?php esc_html_e( 'Requests are typically available within 2-3 business days.', 'animal-giggles' ); ?></p>
					<p class="request-approval request-info"><?php esc_html_e( 'Requests that are deemed inappropriate will be rejected.', 'animal-giggles' ); ?></p>
					<div id="ag-request-status" aria-live="polite"></div>
				</form>			</div>
		<?php

		return ob_get_clean();
	}
}