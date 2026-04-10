package com.bancolombia.leasing.application.usecase;

import com.bancolombia.leasing.application.dto.ManagementUpdateType;

public final class ManagementNoteCodec {

    private ManagementNoteCodec() {
    }

    public static String tag(ManagementUpdateType type, String detail) {
        String safeDetail = detail == null || detail.isBlank() ? "Sin detalle" : detail.trim();
        return "META[" + type.name() + "] " + safeDetail;
    }

    public static ManagementUpdateType extractType(String note, ManagementUpdateType fallback) {
        if (note == null) {
            return fallback;
        }
        String trimmed = note.trim();
        if (!trimmed.startsWith("META[") || !trimmed.contains("]")) {
            return fallback;
        }
        int end = trimmed.indexOf(']');
        String code = trimmed.substring(5, end);
        try {
            return ManagementUpdateType.valueOf(code);
        } catch (IllegalArgumentException ex) {
            return fallback;
        }
    }

    public static String extractDetail(String note) {
        if (note == null) {
            return "Estado actualizado";
        }
        String trimmed = note.trim();
        if (!trimmed.startsWith("META[") || !trimmed.contains("]")) {
            return trimmed;
        }
        int end = trimmed.indexOf(']');
        String detail = trimmed.substring(end + 1).trim();
        return detail.isBlank() ? "Estado actualizado" : detail;
    }
}