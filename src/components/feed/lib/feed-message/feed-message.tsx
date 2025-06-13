/* eslint-disable @next/next/no-img-element */
import classNames from 'classnames';
import { Loader2 } from 'lucide-react';
import React, { useMemo } from 'react';
import Markdown from 'react-markdown';
import { PrismAsync } from 'react-syntax-highlighter';
// TODO: Choose a theme for the code blocks?
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { FormatDateSince } from '~/utils/formatting.utils';

export interface FeedMessageProps {
	sender?: 'user' | 'ai';
	date?: Date;
	meta?: string[];
	text?: string;
	image?: string;
	error?: string;
	isDynamic?: boolean;
}

export const FeedMessage = ({
	sender,
	date,
	meta,
	text,
	image,
	error,
	isDynamic,
}: FeedMessageProps) => {
	const isImage = typeof image === 'string';
	const hasImageLoaded = isImage && image.length > 0;

	const messageDetails = [
		...(date ? [FormatDateSince(date)] : []),
		...(meta ? meta : []),
	];

	const renderContent = useMemo(() => {
		if (error) {
			return <p>{error}</p>;
		}

		if (isImage) {
			return (
				<div className="relative flex h-full w-full items-center justify-center">
					{hasImageLoaded ? (
						<img
							src={image}
							alt="AI Image"
							className="h-full w-full object-cover"
						/>
					) : (
						<Loader2 className="h-4 w-4 animate-spin" />
					)}

					<p className="bg-background text-foreground absolute bottom-2 left-2 z-10 rounded-md p-1 px-2.5 text-xs">
						{text}
					</p>
				</div>
			);
		}

		return (
			<Markdown
				components={{
					code: (props) => {
						const { children, className } = props;
						const match = /language-(\w+)/.exec(className || '');

						return match ? (
							<PrismAsync
								// Delay the syntax highlighting until the message is fully rendered as this blocks UI rendering
								language={isDynamic ? undefined : match[1]}
								style={oneLight}
								showLineNumbers
							>
								{String(children).replace(/\n$/, '')}
							</PrismAsync>
						) : (
							<code className="bg-background text-foreground mx-0.5 rounded-md px-1.5 py-0.5">
								{children}
							</code>
						);
					},
				}}
			>
				{text}
			</Markdown>
		);
	}, [text, image, error, isDynamic, isImage, hasImageLoaded]);

	return (
		<div
			className={classNames('flex w-full flex-col gap-2 p-4', {
				'items-end': sender === 'user',
				'items-start': sender === 'ai',
			})}
		>
			<div
				className={classNames(
					'flex max-w-2/3 flex-col gap-2 overflow-hidden rounded-2xl shadow-sm',
					{
						'px-4 py-2.5': !isImage || error,
						'min-h-[10rem] min-w-[10rem]': isImage && !error,
						'bg-accent text-accent-foreground rounded-br-sm': sender === 'user',
						'bg-foreground text-background rounded-bl-sm': sender === 'ai',
						'!bg-red-500 text-white': !!error,
						'!bg-transparent': hasImageLoaded,
					},
				)}
			>
				{renderContent}
			</div>

			<div className="flex gap-2 text-sm text-gray-500">
				{messageDetails?.map((value, index) => {
					return (
						<React.Fragment key={value}>
							<p>{value}</p>
							{index !== messageDetails.length - 1 ? <span>•</span> : null}
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
};
