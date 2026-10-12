package com.calc.emulator

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class DPadHitTestTest {
    private fun hits(x: Float, y: Float, start: Float) = isPointInSegment(
        Offset(x, y), Size(120f, 120f), start, 90f, 0.45f, 0.16f
    )

    @Test
    fun rightSegmentCrossesZeroDegrees() {
        // Upper right is 333 degrees: a negative start must wrap to 315.
        assertTrue(hits(100f, 40f, -45f))
        assertTrue(hits(100f, 60f, -45f))
        assertTrue(hits(100f, 80f, -45f))
        assertFalse(hits(20f, 60f, -45f))
    }

    @Test
    fun otherDirectionsAndDeadZonesStillWork() {
        assertTrue(hits(60f, 20f, 225f))
        assertTrue(hits(20f, 60f, 135f))
        assertTrue(hits(60f, 100f, 45f))
        assertFalse(hits(60f, 60f, -45f))
        assertFalse(hits(100f, 100f, -45f))
        assertFalse(hits(130f, 60f, -45f))
    }
}
