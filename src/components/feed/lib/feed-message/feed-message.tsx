/* eslint-disable @next/next/no-img-element */
import classNames from 'classnames';
import { ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';
import Markdown from 'react-markdown';
import { PrismAsync } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

import { FormatDateSince } from '~/utils/formatting.utils';

export interface FeedMessageProps {
	sender?: 'user' | 'ai';
	date?: Date;
	meta?: string[];
	text?: string;
	image?: string;
	error?: string;
	isDynamic?: boolean;
	className?: string;
}

export const FeedMessage = ({
	sender,
	date,
	meta,
	text,
	image,
	error,
	isDynamic,
	className,
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
				</div>
			);
		}

		return (
			<Markdown
				remarkPlugins={[remarkGfm]}
				components={{
					code: (props) => {
						const { children, className } = props;
						const match = /language-(\w+)/.exec(className || '');

						return match ? (
							<PrismAsync
								// Delay the syntax highlighting until the message is fully rendered as this blocks UI rendering
								language={isDynamic ? undefined : match[1]}
								style={oneDark}
								showLineNumbers
							>
								{String(children).replace(/\n$/, '')}
							</PrismAsync>
						) : (
							<code className="bg-background mx-0.5 rounded-md px-1.5 py-0.5 whitespace-normal">
								{children}
							</code>
						);
					},
					h1: ({ children, className }) => {
						return (
							<h1
								className={classNames(
									className,
									'font-slab text-2xl font-black',
								)}
							>
								{children}
							</h1>
						);
					},
					h2: ({ children, className }) => {
						return (
							<h2
								className={classNames(
									className,
									'font-slab text-lg font-black',
								)}
							>
								{children}
							</h2>
						);
					},
					h3: ({ children, className }) => {
						return (
							<h3
								className={classNames(
									className,
									'font-slab text-lg font-semibold',
								)}
							>
								{children}
							</h3>
						);
					},
					strong: ({ children, className }) => {
						return (
							<strong className={classNames(className, 'font-bold')}>
								{children}
							</strong>
						);
					},
					a: ({ children, className, href }) => {
						return (
							<Link
								href={href ?? '#'}
								target="_blank"
								className={classNames(
									className,
									'text-accent inline-flex items-center gap-1 hover:opacity-75',
								)}
							>
								{children}
								<ExternalLink className="h-4 w-4" />
							</Link>
						);
					},
					ul: ({ children, className }) => {
						return (
							<ul
								className={classNames(
									className,
									'marker:text-foreground/75 ml-4 list-disc',
								)}
							>
								{children}
							</ul>
						);
					},
					ol: ({ children, className }) => {
						return (
							<ol
								className={classNames(
									className,
									'marker:text-foreground/75 marker:font-slab ml-4 list-decimal marker:font-semibold',
								)}
							>
								{children}
							</ol>
						);
					},
					blockquote: ({ children, className }) => {
						return (
							<blockquote
								className={classNames(
									className,
									'border-accent font-slab border-l-4 pl-4',
								)}
							>
								{children}
							</blockquote>
						);
					},
					table: ({ children, className }) => {
						return (
							<div className="shadow-background/5 overflow-auto rounded-md border shadow-md">
								<table className={classNames(className, 'w-full table-auto')}>
									{children}
								</table>
							</div>
						);
					},
					th: ({ children, className }) => {
						return (
							<th
								className={classNames(
									className,
									'bg-background text-foreground font-slab px-2 py-1',
								)}
							>
								{children}
							</th>
						);
					},
					td: ({ children, className }) => {
						return (
							<td
								className={classNames(
									className,
									'px-2 py-1 not-first:border-l',
								)}
							>
								{children}
							</td>
						);
					},
					tr: ({ children, className }) => {
						return (
							<tr className={classNames(className, 'even:bg-background/15')}>
								{children}
							</tr>
						);
					},
				}}
			>
				{text || 'No Response'}
			</Markdown>
		);
	}, [text, image, error, isDynamic, isImage, hasImageLoaded]);

	return (
		<div
			className={classNames(
				'flex w-full flex-col gap-2',
				{
					'items-end': sender === 'user',
					'items-start': sender === 'ai',
				},
				className,
			)}
		>
			<div
				className={classNames(
					'flex max-w-full flex-col gap-2 overflow-hidden shadow-sm md:max-w-2/3',
					{
						'px-4 py-2.5': !isImage || error,
						'min-h-[10rem] min-w-[10rem]': isImage && !error,
						'bg-accent text-accent-foreground rounded-3xl rounded-br-sm':
							sender === 'user',
						'text-foreground bg-glass !rounded-bl-sm': sender === 'ai',
						'!bg-red-500 text-white': !!error,
						'!bg-transparent': hasImageLoaded,
						'text-foreground/50': !isImage && !text,
					},
				)}
			>
				{renderContent}
			</div>

			<div className="font-slab text-foreground/75 flex gap-1.5 text-xs">
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
