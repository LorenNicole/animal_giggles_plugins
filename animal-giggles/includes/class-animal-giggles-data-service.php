<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Animal_Giggles_Data_Service {

	/**
	 * Register AJAX hooks.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'wp_ajax_ag_submit_image_rating', array( $this, 'ajax_submit_image_rating' ) );
		add_action( 'wp_ajax_nopriv_ag_submit_image_rating', array( $this, 'ajax_submit_image_rating' ) );

		add_action( 'wp_ajax_ag_track_share_click', array( $this, 'ajax_track_share_click' ) );
		add_action( 'wp_ajax_nopriv_ag_track_share_click', array( $this, 'ajax_track_share_click' ) );

		add_action( 'wp_ajax_ag_track_make_me_giggle_click', array( $this, 'ajax_track_make_me_giggle_click' ) );
		add_action( 'wp_ajax_nopriv_ag_track_make_me_giggle_click', array( $this, 'ajax_track_make_me_giggle_click' ) );

		add_action( 'wp_ajax_ag_submit_animal_request', array( $this, 'ajax_submit_animal_request' ) );
		add_action( 'wp_ajax_nopriv_ag_submit_animal_request', array( $this, 'ajax_submit_animal_request' ) );

		add_action( 'wp_ajax_ag_get_captions', array( $this, 'ajax_get_captions' ) );
		add_action( 'wp_ajax_nopriv_ag_get_captions', array( $this, 'ajax_get_captions' ) );

		add_action( 'wp_ajax_ag_submit_caption', array( $this, 'ajax_submit_caption' ) );
		add_action( 'wp_ajax_nopriv_ag_submit_caption', array( $this, 'ajax_submit_caption' ) );
	}

	public function get_animal_config() {
		global $wpdb;

		$table_name = 'images';

		$rows = $wpdb->get_results(
			"
			SELECT
				i.*,
				r.name AS requestor_name,
				r.country AS requestor_country
			FROM {$table_name} i
			LEFT JOIN requests r
				ON r.imageId = i.ImageId
			WHERE i.status = 'active'
				AND i.StoragePathDisplay IS NOT NULL
				AND TRIM(i.StoragePathDisplay) <> ''
			ORDER BY i.ImageName ASC
			",
			ARRAY_A
		);


		if ( '' !== $wpdb->last_error ) {
			Animal_Giggles_Logger::error(
				'query database images table',
				$wpdb->last_error,
				array(
					'query' => 'get_animal_config images query',
				)
			);

			return array(
				'head_options'     => array(),
				'body_options'     => array(),
				'butt_options'     => array(),
				'body_options_map' => array(),
				'butt_options_map' => array(),
				'image_rows'       => array(),
			);
		}

		$head_values      = array();
		$body_values      = array();
		$butt_values      = array();
		$body_options_map = array();
		$butt_options_map = array();
		$image_rows       = array();

		if ( empty( $rows ) ) {
			return array(
				'head_options'     => array(),
				'body_options'     => array(),
				'butt_options'     => array(),
				'body_options_map' => array(),
				'butt_options_map' => array(),
				'image_rows'       => array(),
			);
		}

		$row_number = 0;

		foreach ( $rows as $row ) {
			$row_number++;

			$head = isset( $row['ImageHead'] ) ? strtolower( trim( (string) $row['ImageHead'] ) ) : '';
			$body = isset( $row['ImageBody'] ) ? strtolower( trim( (string) $row['ImageBody'] ) ) : '';
			$butt = isset( $row['ImageButt'] ) ? strtolower( trim( (string) $row['ImageButt'] ) ) : '';

			if ( '' === $butt && '' !== $body ) {
				$butt = $body;
			}

			$storage_path = isset( $row['StoragePathDisplay'] ) ? trim( (string) $row['StoragePathDisplay'] ) : '';

			if ( '' !== $head ) {
				$head_values[ $head ] = $head;
			}

			if ( '' !== $body ) {
				$body_values[ $body ] = $body;
			}

			if ( '' !== $butt ) {
				$butt_values[ $butt ] = $butt;
			}

			if ( '' !== $head && '' !== $body ) {
				if ( ! isset( $body_options_map[ $head ] ) ) {
					$body_options_map[ $head ] = array();
				}

				$body_options_map[ $head ][ $body ] = array(
					'value' => $body,
					'label' => $body,
				);
			}

			if ( '' !== $body && '' !== $butt ) {
				if ( ! isset( $butt_options_map[ $body ] ) ) {
					$butt_options_map[ $body ] = array();
				}

				$butt_options_map[ $body ][ $butt ] = array(
					'value' => $butt,
					'label' => $butt,
				);
			}

			if ( '' !== $head && '' !== $body && '' !== $butt && '' !== $storage_path ) {
				$image_rows[] = array(
					'imageId'           => isset( $row['ImageId'] ) ? (int) $row['ImageId'] : 0,
					'productId'         => isset( $row['ProductId'] ) ? (string) $row['ProductId'] : '',
					'rowNumber'         => $row_number,
					'head'              => $head,
					'headLabel'         => $head,
					'body'              => $body,
					'bodyLabel'         => $body,
					'butt'              => $butt,
					'buttLabel'         => $butt,
					'StoragePathDisplay' 		=> $storage_path,
					'requestorName'     => isset( $row['requestor_name'] ) ? sanitize_text_field( (string) $row['requestor_name'] ) : '',
					'requestorCountry'  => isset( $row['requestor_country'] ) ? sanitize_text_field( (string) $row['requestor_country'] ) : '',
				);
			}
		}

		return array(
			'head_options'     => $this->map_values_to_options( $head_values ),
			'body_options'     => $this->map_values_to_options( $body_values ),
			'butt_options'     => $this->map_values_to_options( $butt_values ),
			'body_options_map' => array_map( 'array_values', $body_options_map ),
			'butt_options_map' => array_map( 'array_values', $butt_options_map ),
			'image_rows'       => $image_rows,
		);
	}

	private function map_values_to_options( $values ) {
		$options = array();

		foreach ( $values as $value_key => $label ) {
			$options[] = array(
				'value' => $value_key,
				'label' => $label,
			);
		}

		return $options;
	}

	/**
	 * Handle AJAX image rating submission.
	 *
	 * @return void
	 */
	public function ajax_submit_image_rating() {
		check_ajax_referer( 'ag_nonce', 'nonce' );
	
		global $wpdb;
	
		$image_id = isset( $_POST['image_id'] ) ? (int) $_POST['image_id'] : 0;
		$rating   = isset( $_POST['rating'] ) ? (int) $_POST['rating'] : 0;
	
		if ( $image_id <= 0 ) {
			wp_send_json_error(
				array( 'message' => __( 'Invalid image ID.', 'animal-giggles' ) ),
				400
			);
		}
	
		if ( $rating < 1 || $rating > 5 ) {
			wp_send_json_error(
				array( 'message' => __( 'Invalid rating value.', 'animal-giggles' ) ),
				400
			);
		}
	
		$table = 'ag_image_ratings';
	
		$count_column = "rating_{$rating}_count";
		$date_column  = "rating_{$rating}_last_updated";
	
		$sql = "
			INSERT INTO {$table} (
				ImageId,
				{$count_column},
				{$date_column},
				total_ratings,
				rating_sum,
				average_rating,
				last_rating_updated
			)
			VALUES (
				%d,
				1,
				NOW(),
				1,
				%d,
				%d,
				NOW()
			)
			ON DUPLICATE KEY UPDATE
				{$count_column} = {$count_column} + 1,
				{$date_column} = NOW(),
				total_ratings = total_ratings + 1,
				rating_sum = rating_sum + %d,
				average_rating = (rating_sum + %d) / (total_ratings + 1),
				last_rating_updated = NOW()
		";
	
		$prepared_sql = $wpdb->prepare(
			$sql,
			$image_id,
			$rating,
			$rating,
			$rating,
			$rating
		);
	
		$result = $wpdb->query( $prepared_sql );
	
		if ( false === $result || '' !== $wpdb->last_error ) {
			Animal_Giggles_Logger::error(
				'submit image rating',
				$wpdb->last_error ? $wpdb->last_error : 'Unknown database error while saving rating.',
				array(
					'image_id' => $image_id,
					'rating'   => $rating,
					'query'    => 'insert/update ag_image_ratings',
				)
			);
	
			wp_send_json_error(
				array( 'message' => __( 'Failed to save rating.', 'animal-giggles' ) ),
				500
			);
		}
	
		$rating_query = $wpdb->prepare(
			"
			SELECT
				ImageId,
				rating_1_count,
				rating_1_last_updated,
				rating_2_count,
				rating_2_last_updated,
				rating_3_count,
				rating_3_last_updated,
				rating_4_count,
				rating_4_last_updated,
				rating_5_count,
				rating_5_last_updated,
				total_ratings,
				rating_sum,
				average_rating,
				last_rating_updated
			FROM {$table}
			WHERE ImageId = %d
			LIMIT 1
			",
			$image_id
		);
	
		$rating_row = $wpdb->get_row( $rating_query, ARRAY_A );
	
		if ( '' !== $wpdb->last_error ) {
			Animal_Giggles_Logger::error(
				'load image rating summary',
				$wpdb->last_error,
				array(
					'image_id' => $image_id,
					'query'    => 'select ag_image_ratings summary',
				)
			);
	
			wp_send_json_error(
				array( 'message' => __( 'Rating saved, but summary could not be loaded.', 'animal-giggles' ) ),
				500
			);
		}
	
		if ( ! $rating_row ) {
			Animal_Giggles_Logger::error(
				'load image rating summary',
				'Rating row was not found after save.',
				array(
					'image_id' => $image_id,
					'rating'   => $rating,
				)
			);
	
			wp_send_json_error(
				array( 'message' => __( 'Rating saved, but summary could not be loaded.', 'animal-giggles' ) ),
				500
			);
		}
	
		wp_send_json_success(
			array(
				'message' => __( 'Rating submitted successfully.', 'animal-giggles' ),
				'ratings' => $rating_row,
			)
		);
	}

	/**
	 * Track a share click event.
	 *
	 * @return void
	 */
	public function ajax_track_share_click() {
		check_ajax_referer( 'ag_nonce', 'nonce' );
	
		global $wpdb;
	
		$product_id = isset( $_POST['product_id'] ) ? sanitize_text_field( wp_unslash( $_POST['product_id'] ) ) : '';
		$platform   = isset( $_POST['platform'] ) ? sanitize_text_field( wp_unslash( $_POST['platform'] ) ) : '';
		$shared_url = isset( $_POST['shared_url'] ) ? esc_url_raw( wp_unslash( $_POST['shared_url'] ) ) : '';
	
		if ( '' === $product_id ) {
			wp_send_json_error(
				array(
					'message' => __( 'Missing ProductId.', 'animal-giggles' ),
				),
				400
			);
		}
	
		$allowed_platforms = array( 'copy', 'native', 'facebook', 'x', 'pinterest' );
	
		if ( ! in_array( $platform, $allowed_platforms, true ) ) {
	
			Animal_Giggles_Logger::error(
				'invalid share platform',
				'Invalid share platform submitted.',
				array(
					'product_id' => $product_id,
					'platform'   => $platform,
					'shared_url' => $shared_url,
				)
			);
	
			wp_send_json_error(
				array(
					'message' => __( 'Invalid platform.', 'animal-giggles' ),
				),
				400
			);
		}
	
		$table_name = 'ag_share_clicks';
	
		$result = $wpdb->insert(
			$table_name,
			array(
				'ProductId'  => $product_id,
				'platform'   => $platform,
				'shared_url' => $shared_url,
				'created_at' => current_time( 'mysql' ),
			),
			array(
				'%s',
				'%s',
				'%s',
				'%s',
			)
		);
	
		if ( false === $result || '' !== $wpdb->last_error ) {
	
			Animal_Giggles_Logger::error(
				'track share click',
				$wpdb->last_error ? $wpdb->last_error : 'Unknown database error while tracking share click.',
				array(
					'product_id' => $product_id,
					'platform'   => $platform,
					'shared_url' => $shared_url,
					'table'      => $table_name,
				)
			);
	
			wp_send_json_error(
				array(
					'message' => __( 'Failed to track share click.', 'animal-giggles' ),
				),
				500
			);
		}
	
		wp_send_json_success(
			array(
				'message' => __( 'Share click tracked.', 'animal-giggles' ),
			)
		);
	}

	/**
	 * Track Make Me Giggle button clicks.
	 *
	 * @return void
	 */
	public function ajax_track_make_me_giggle_click() {
		check_ajax_referer( 'ag_nonce', 'nonce' );
	
		global $wpdb;
	
		$product_id        = isset( $_POST['product_id'] ) ? sanitize_text_field( wp_unslash( $_POST['product_id'] ) ) : '';
		$url               = isset( $_POST['url'] ) ? esc_url_raw( wp_unslash( $_POST['url'] ) ) : '';
		$user_timezone     = isset( $_POST['user_timezone'] ) ? sanitize_text_field( wp_unslash( $_POST['user_timezone'] ) ) : '';
		$random_generation = isset( $_POST['random_generation'] ) ? (int) $_POST['random_generation'] : 0;
	
		if ( '' === $product_id ) {
			wp_send_json_error(
				array( 'message' => __( 'Missing ProductId.', 'animal-giggles' ) ),
				400
			);
		}
	
		if ( '' === $url ) {
			wp_send_json_error(
				array( 'message' => __( 'Missing URL.', 'animal-giggles' ) ),
				400
			);
		}
	
		$table_name = 'ag_make_me_giggle_btn_clicks';
	
		$result = $wpdb->insert(
			$table_name,
			array(
				'ProductId'         => $product_id,
				'Url'               => $url,
				'DateTime'          => current_time( 'mysql' ),
				'UserTimezone'      => $user_timezone,
				'Random_generation' => $random_generation,
			),
			array(
				'%s',
				'%s',
				'%s',
				'%s',
				'%d',
			)
		);
	
		if ( false === $result || '' !== $wpdb->last_error ) {
			Animal_Giggles_Logger::error(
				'track make me giggle click',
				$wpdb->last_error ? $wpdb->last_error : 'Unknown database error while logging Make Me Giggle click.',
				array(
					'product_id'        => $product_id,
					'url'               => $url,
					'user_timezone'     => $user_timezone,
					'random_generation' => $random_generation,
					'table'             => $table_name,
				)
			);
	
			wp_send_json_error(
				array( 'message' => __( 'Failed to log Make Me Giggle click.', 'animal-giggles' ) ),
				500
			);
		}
	
		wp_send_json_success(
			array( 'message' => __( 'Make Me Giggle click logged.', 'animal-giggles' ) )
		);
	}

	public function ajax_submit_animal_request() {
		check_ajax_referer( 'ag_nonce', 'nonce' );
	
		$consent = isset( $_POST['consent'] )
			? sanitize_text_field( wp_unslash( $_POST['consent'] ) )
			: '';
	
		if ( empty( $consent ) ) {
			wp_send_json_error(
				array( 'message' => __( 'You must agree before submitting.', 'animal-giggles' ) ),
				400
			);
		}
	
		global $wpdb;
	
		$head     = isset( $_POST['head'] ) ? sanitize_text_field( wp_unslash( $_POST['head'] ) ) : '';
		$body     = isset( $_POST['body'] ) ? sanitize_text_field( wp_unslash( $_POST['body'] ) ) : '';
		$butt     = isset( $_POST['butt'] ) ? sanitize_text_field( wp_unslash( $_POST['butt'] ) ) : '';
		$setting  = isset( $_POST['setting'] ) ? sanitize_textarea_field( wp_unslash( $_POST['setting'] ) ) : '';
		$country  = isset( $_POST['country'] ) ? sanitize_text_field( wp_unslash( $_POST['country'] ) ) : '';
		$comments = isset( $_POST['comments'] ) ? sanitize_textarea_field( wp_unslash( $_POST['comments'] ) ) : '';
	
		$name = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
		$name = trim( $name );
		$name = substr( $name, 0, 30 );
		$name = preg_replace( "/[^a-zA-Z\s\-\']/", '', $name );
	
		if ( '' === $name ) {
			$name = 'anonymous';
		}
	
		if ( '' === $head || '' === $body || '' === $butt || '' === $country ) {
			wp_send_json_error(
				array( 'message' => __( 'Please complete all required fields.', 'animal-giggles' ) ),
				400
			);
		}
	
		$table_name = 'Requests';
	
		$result = $wpdb->insert(
			$table_name,
			array(
				'head'           => $head,
				'body'           => $body,
				'butt'           => $butt,
				'setting'        => '' !== $setting ? $setting : null,
				'name'           => $name,
				'country'        => $country,
				'consent'        => 1,
				'request_date'   => current_time( 'mysql' ),
				'request_status' => 'pending',
				'comments'       => $comments,
			),
			array(
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%d',
				'%s',
				'%s',
				'%s',
			)
		);
	
		if ( false === $result || '' !== $wpdb->last_error ) {
			Animal_Giggles_Logger::error(
				'submit animal request',
				$wpdb->last_error ? $wpdb->last_error : 'Unknown database error while submitting animal request.',
				array(
					'head'      => $head,
					'body'      => $body,
					'butt'      => $butt,
					'country'   => $country,
					'name'      => $name,
					'table'     => $table_name,
				)
			);
	
			wp_send_json_error(
				array( 'message' => __( 'Unable to submit request right now.', 'animal-giggles' ) ),
				500
			);
		}
	
		wp_send_json_success(
			array( 'message' => __( 'Request submitted. Thank you!', 'animal-giggles' ) )
		);
	}

	/**
	 * Fetch approved captions for an image.
	 *
	 * @return void
	 */
	public function ajax_get_captions() {
		check_ajax_referer( 'ag_nonce', 'nonce' );
	
		$image_id = isset( $_POST['image_id'] ) ? (int) $_POST['image_id'] : 0;
	
		if ( $image_id < 1 ) {
			wp_send_json_error(
				array( 'message' => __( 'Invalid image.', 'animal-giggles' ) ),
				400
			);
		}
	
		global $wpdb;
	
		$query = $wpdb->prepare(
			"
			SELECT id, caption
			FROM captions
			WHERE image_id = %d
				AND status = 'approved'
			ORDER BY dateadded DESC, id DESC
			",
			$image_id
		);
	
		$rows = $wpdb->get_results( $query, ARRAY_A );
	
		if ( '' !== $wpdb->last_error ) {
			Animal_Giggles_Logger::error(
				'get approved captions',
				$wpdb->last_error,
				array(
					'image_id' => $image_id,
					'query'    => 'ajax_get_captions',
				)
			);
	
			wp_send_json_error(
				array( 'message' => __( 'Unable to load captions right now.', 'animal-giggles' ) ),
				500
			);
		}
	
		$captions = array();
	
		if ( ! empty( $rows ) ) {
			foreach ( $rows as $row ) {
				$captions[] = array(
					'id'      => isset( $row['id'] ) ? (int) $row['id'] : 0,
					'caption' => isset( $row['caption'] ) ? esc_html( $row['caption'] ) : '',
				);
			}
		}
	
		wp_send_json_success(
			array(
				'captions' => $captions,
			)
		);
	}

	/**
	 * Submit a caption for moderation (pending).
	 *
	 * @return void
	 */
	public function ajax_submit_caption() {
		check_ajax_referer( 'ag_nonce', 'nonce' );
	
		$image_id = isset( $_POST['image_id'] ) ? (int) $_POST['image_id'] : 0;
	
		$caption = isset( $_POST['caption'] )
			? sanitize_textarea_field( wp_unslash( $_POST['caption'] ) )
			: '';
	
		$caption = trim( $caption );
	
		if ( $image_id < 1 ) {
			wp_send_json_error(
				array( 'message' => __( 'Invalid image.', 'animal-giggles' ) ),
				400
			);
		}
	
		if ( '' === $caption ) {
			wp_send_json_error(
				array( 'message' => __( 'Please enter a caption.', 'animal-giggles' ) ),
				400
			);
		}
	
		if ( mb_strlen( $caption ) > 120 ) {
			wp_send_json_error(
				array( 'message' => __( 'Caption must be 120 characters or fewer.', 'animal-giggles' ) ),
				400
			);
		}
	
		global $wpdb;
	
		$image_exists_query = $wpdb->prepare(
			'SELECT ImageId FROM images WHERE ImageId = %d LIMIT 1',
			$image_id
		);
	
		$image_exists = $wpdb->get_var( $image_exists_query );
	
		if ( '' !== $wpdb->last_error ) {
			Animal_Giggles_Logger::error(
				'validate caption image',
				$wpdb->last_error,
				array(
					'image_id' => $image_id,
					'query'    => 'check image exists before caption insert',
				)
			);
	
			wp_send_json_error(
				array( 'message' => __( 'Unable to validate image right now.', 'animal-giggles' ) ),
				500
			);
		}
	
		if ( ! $image_exists ) {
	
			Animal_Giggles_Logger::error(
				'caption image not found',
				'Image does not exist for caption submission.',
				array(
					'image_id' => $image_id,
				)
			);
	
			wp_send_json_error(
				array( 'message' => __( 'Image not found.', 'animal-giggles' ) ),
				404
			);
		}
	
		$result = $wpdb->insert(
			'captions',
			array(
				'image_id'  => $image_id,
				'caption'   => $caption,
				'status'    => 'pending',
				'dateadded' => current_time( 'mysql' ),
			),
			array(
				'%d',
				'%s',
				'%s',
				'%s',
			)
		);
	
		if ( false === $result || '' !== $wpdb->last_error ) {
	
			Animal_Giggles_Logger::error(
				'submit caption',
				$wpdb->last_error ? $wpdb->last_error : 'Unknown database error while inserting caption.',
				array(
					'image_id' => $image_id,
					'caption'  => mb_substr( $caption, 0, 120 ),
					'table'    => 'captions',
				)
			);
	
			wp_send_json_error(
				array( 'message' => __( 'Unable to submit caption right now.', 'animal-giggles' ) ),
				500
			);
		}
	
		wp_send_json_success(
			array(
				'message' => __( 'Thanks! Your caption is pending approval (1–3 days).', 'animal-giggles' ),
			)
		);
	}
}