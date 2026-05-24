class Animal_Giggles_Logger {

    public static function error( $source, $message, $context = array() ) {
        global $wpdb;

        $wpdb->insert(
            'ag_error_logs',
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

        self::maybe_send_email( $source, $message );
    }

    private static function maybe_send_email( $source, $message ) {
        $transient_key = 'ag_error_email_' . md5( $source . $message );

        if ( get_transient( $transient_key ) ) {
            return;
        }

        set_transient( $transient_key, 1, 15 * MINUTE_IN_SECONDS );

        wp_mail(
            get_option( 'admin_email' ),
            'Animal Giggles Error: ' . $source,
            $message
        );
    }
}