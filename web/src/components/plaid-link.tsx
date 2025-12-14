"use client"

import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink, PlaidLinkOnSuccess, PlaidLinkOptions } from 'react-plaid-link';
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { createClient } from '@/lib/supabase/client'

export const PlaidLink = () => {
    const [token, setToken] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const createLinkToken = async () => {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                console.error('No active session');
                return;
            }

            const response = await fetch('http://localhost:4000/api/create_link_token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`, // Send auth token
                },
            });

            const data = await response.json();
            setToken(data.link_token);
        };

        createLinkToken();
    }, []);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token) => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            console.error('No active session');
            return;
        }

        await fetch('http://localhost:4000/api/set_access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`, // Send auth token
            },
            body: JSON.stringify({ public_token }),
        });
    }, []);

    const config: PlaidLinkOptions = {
        token,
        onSuccess,
    };

    const { open, ready } = usePlaidLink(config);

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
