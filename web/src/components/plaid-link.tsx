"use client"

import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink, PlaidLinkOnSuccess, PlaidLinkOptions } from 'react-plaid-link';
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { createClient } from '@/lib/supabase/client'

interface PlaidLinkProps {
    mode?: 'create' | 'update';
    plaidItemId?: string;
    institutionName?: string;
    onSuccess?: () => void;
}

export const PlaidLink = ({
    mode = 'create',
    plaidItemId,
    institutionName,
    onSuccess: onSuccessCallback,
}: PlaidLinkProps) => {
    const [token, setToken] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchLinkToken = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                console.error('No active session');
                return;
            }

            if (mode === 'update' && plaidItemId) {
                // Update mode: fetch update link token with item's access_token
                const response = await fetch('http://localhost:4000/api/plaid/create_update_link_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ plaid_item_id: plaidItemId }),
                });
                const data = await response.json();
                setToken(data.link_token);
            } else {
                // Create mode: fetch regular link token
                const response = await fetch('http://localhost:4000/api/plaid/create_link_token', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                });
                const data = await response.json();
                setToken(data.link_token);
            }
        };

        fetchLinkToken();
    }, [mode, plaidItemId]);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token) => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            console.error('No active session');
            return;
        }

        if (mode === 'update' && plaidItemId) {
            // Update mode: no public token exchange needed, just notify backend
            await fetch('http://localhost:4000/api/plaid/update_success', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ plaid_item_id: plaidItemId }),
            });
        } else {
            // Create mode: exchange public token for access token
            await fetch('http://localhost:4000/api/plaid/set_access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ public_token }),
            });
        }

        onSuccessCallback?.();
    }, [mode, plaidItemId, onSuccessCallback]);

    const config: PlaidLinkOptions = {
        token,
        onSuccess,
    };

    const { open, ready } = usePlaidLink(config);

    if (mode === 'update') {
        return (
            <Button
                size="sm"
                variant="outline"
                className="border-amber-500 text-amber-600 hover:bg-amber-50"
                onClick={() => open()}
                disabled={!ready}
            >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reconnect{institutionName ? ` ${institutionName}` : ''}
            </Button>
        );
    }

    return (
        <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => open()}
            disabled={!ready}
        >
            <Plus className="mr-2 h-4 w-4" />
            Add account
        </Button>
    );
};
