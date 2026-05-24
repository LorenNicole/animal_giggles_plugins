<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Animal_Giggles_Logger {

	public static function error( $source, $message, $context = array() ) {
		global $wpdb;

		$table_name = 'ag_error_logs';

		$wpdb->insert(
			$table_name,
			array(
				'level'      => 'error',
				'source'     => sanitize_text_field( $source ),
				'message'    => sanitize_textarea_field( $message ),
				'context'    => wp_json_encode( $context ),
				'url'        => esc_url_raw( $_SERVER['REQUEST_URI'] ?? '' ),
				'user_agent' => sanitize_text_field( $_SERVER['HTTP_USER_AGENT'] ?? '' ),
				'created_at' => current_time( 'mysql' ),
			),
			array( '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
		);

		self::maybe_send_email( $source, $message, $context );
	}

	private static function maybe_send_email( $source, $message, $context = array() ) {
		$to = get_option( 'admin_email' );

		if ( empty( $to ) ) {
			return;
		}

		$transient_key = 'ag_error_email_' . md5( $source . $message );

		if ( get_transient( $transient_key ) ) {
			return;
		}

		set_transient( $transient_key, 1, 15 * MINUTE_IN_SECONDS );

		$subject = '[Animal Giggles] Error: ' . sanitize_text_field( $source );

		$body =
			"An Animal Giggles error was logged.\n\n" .
			"Source: " . sanitize_text_field( $source ) . "\n\n" .
			"Message:\n" . sanitize_textarea_field( $message ) . "\n\n" .
			"URL: " . esc_url_raw( $_SERVER['REQUEST_URI'] ?? '' ) . "\n\n" .
			"Time: " . current_time( 'mysql' ) . "\n\n" .
			"Context:\n" . print_r( $context, true );

        if ( function_exists( 'wp_mail' ) ) {
            wp_mail( $to, $subject, $body );
        }
	}
}