#include <pebble.h>
#include <stdint.h>

int32_t isQuietTimeActive(void) {
    return quiet_time_is_active() ? 1 : 0;
}
